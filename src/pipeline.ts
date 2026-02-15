/**
 * @brivora/verify — 5-stage governance pipeline
 *
 * DEFINE → OBSERVE/PRE-EVALUATE → EXECUTE → POST-EVALUATE → PROVE
 *
 * Every AI call flows through all 5 stages. The pipeline is the core
 * orchestration layer that ties everything together.
 * @module
 */

import { evaluateRules } from './evaluator.js';
import { createEvent, hashGovernancePack, hashSystemState } from './events.js';
import { loadPack } from './pack.js';
import { generateProof, hashProof } from './proof.js';
import { generateReport } from './report.js';
import { computeFidelityScore } from './score.js';
import type {
	EvalContext,
	GovernanceEvent,
	GovernancePack,
	GovernOptions,
	GovernResult,
	RuleResult,
	Verifier,
} from './types.js';
import { createVerifier } from './verifier.js';

/**
 * Run the 5-stage governance pipeline.
 */
export async function runPipeline<T>(
	fn: () => Promise<T>,
	options: GovernOptions,
): Promise<GovernResult<T>> {
	const totalStart = performance.now();
	let govStart = performance.now();

	// ═══ Stage 1: DEFINE ═══
	const pack = resolvePack(options.governance);
	const verifier = options.verifier ?? (await createVerifier());
	const timestamp = new Date().toISOString();
	const events: GovernanceEvent[] = [];

	const governancePolicyHash = hashGovernancePack(pack);

	events.push(
		createEvent(
			'GOVERNANCE_LOADED',
			{
				pack_name: pack.name,
				pack_version: pack.version,
				rule_count: pack.rules.length,
				threshold: pack.scoring.threshold,
			},
			undefined,
			timestamp,
		),
	);

	// ═══ Stage 2: OBSERVE + PRE-EVALUATE ═══
	// We can't inspect the function itself — we observe what we can
	// and run pre-call rules against available context
	const preCtx: EvalContext = {
		prompt: extractFromMetadata(options.metadata, 'prompt'),
		model: extractFromMetadata(options.metadata, 'model'),
		parameters: extractFromMetadata(options.metadata, 'parameters') as
			| Record<string, unknown>
			| undefined,
		ruleResults: [],
	};

	events.push(
		createEvent(
			'PROMPT_RECEIVED',
			{
				has_prompt: preCtx.prompt !== undefined,
				has_model: preCtx.model !== undefined,
				timestamp,
			},
			events[events.length - 1]!.hash,
			timestamp,
		),
	);

	const preResults = evaluateRules(pack.rules, preCtx, 'pre');

	events.push(
		createEvent(
			'PRE_EVALUATION',
			{
				results: preResults.map((r) => ({
					rule_id: r.rule_id,
					result: r.result,
					severity: r.severity,
				})),
				phase: 'pre',
			},
			events[events.length - 1]!.hash,
			timestamp,
		),
	);

	// Check for critical pre-evaluation failures → circuit break
	// Only circuit-break on pre-only rules, NOT on 'both' phase rules
	// (which will be re-evaluated in post with full data including response)
	const preOnlyRuleIds = new Set(pack.rules.filter((r) => r.phase === 'pre').map((r) => r.id));
	const criticalPreFails = preResults.filter(
		(r) => r.result === 'FAIL' && r.severity === 'critical' && preOnlyRuleIds.has(r.rule_id),
	);
	if (criticalPreFails.length > 0) {
		return handleCircuitBreak(
			events,
			pack,
			verifier,
			preResults,
			governancePolicyHash,
			options,
			timestamp,
			totalStart,
			govStart,
		);
	}

	if (options.onPreEval) {
		options.onPreEval({ ...preCtx, ruleResults: preResults });
	}

	const govPreTime = performance.now() - govStart;

	// ═══ Stage 3: EXECUTE ═══
	const aiStart = performance.now();

	events.push(
		createEvent(
			'MODEL_INVOCATION',
			{ timestamp: new Date().toISOString() },
			events[events.length - 1]!.hash,
			timestamp,
		),
	);

	let output: T;
	try {
		if (options.timeout) {
			output = await Promise.race([
				fn(),
				new Promise<never>((_, reject) =>
					setTimeout(() => reject(new Error('AI call timed out')), options.timeout),
				),
			]);
		} else {
			output = await fn();
		}
	} catch (err) {
		// Even on error, we generate a proof of the attempt
		events.push(
			createEvent(
				'GOVERNANCE_VIOLATION',
				{
					error: err instanceof Error ? err.message : String(err),
					phase: 'execute',
				},
				events[events.length - 1]!.hash,
				timestamp,
			),
		);
		throw err;
	}

	const aiCallTime = performance.now() - aiStart;

	events.push(
		createEvent(
			'RESPONSE_RECEIVED',
			{
				has_response: output !== undefined && output !== null,
				response_type: typeof output,
				timing_ms: aiCallTime,
			},
			events[events.length - 1]!.hash,
			timestamp,
		),
	);

	// ═══ Stage 4: POST-EVALUATE ═══
	govStart = performance.now();

	const postCtx: EvalContext = {
		...preCtx,
		response: output,
		timing: { aiCall: aiCallTime },
		ruleResults: preResults,
	};

	const postResults = evaluateRules(pack.rules, postCtx, 'post');
	const allResults = [...preResults, ...postResults];

	events.push(
		createEvent(
			'POST_EVALUATION',
			{
				results: postResults.map((r) => ({
					rule_id: r.rule_id,
					result: r.result,
					severity: r.severity,
				})),
				phase: 'post',
			},
			events[events.length - 1]!.hash,
			timestamp,
		),
	);

	// Compute fidelity score
	const fidelityScore = computeFidelityScore(allResults, pack.scoring);
	const evaluationResult = determineEvaluationResult(allResults);

	// Enrich post context for hooks
	postCtx.fidelity_score = fidelityScore;
	postCtx.evaluation_result = evaluationResult;
	postCtx.governance_result = {
		pack: pack.name,
		version: pack.version,
		result: evaluationResult,
		score: fidelityScore.overall,
	};
	postCtx.ruleResults = allResults;

	events.push(
		createEvent(
			'FIDELITY_SCORE',
			{
				overall: fidelityScore.overall,
				dimensions: fidelityScore.dimensions,
				threshold: fidelityScore.threshold,
				passed: fidelityScore.passed,
			},
			events[events.length - 1]!.hash,
			timestamp,
		),
	);

	if (options.onPostEval) {
		options.onPostEval(postCtx);
	}

	const govPostTime = performance.now() - govStart;

	// ═══ Stage 5: PROVE ═══
	const proofStart = performance.now();

	const systemStateHash = hashSystemState({
		pack: pack.name,
		version: pack.version,
		timestamp,
		rule_count: pack.rules.length,
	});

	const proof = await generateProof({
		events,
		verifier,
		governancePolicyHash,
		systemStateHash,
		fidelityScore,
		evaluationResult,
		subject: extractFromMetadata(options.metadata, 'subject') ?? 'ai-system',
		previousProof: options.chain?.getLastHash(),
		metadata: options.metadata,
		timestamp,
	});

	events.push(
		createEvent(
			'PROOF_GENERATED',
			{
				merkle_root: proof.merkle_root.value,
				evaluation_result: evaluationResult,
				has_chain: proof.previous_proof !== undefined,
			},
			events[events.length - 1]!.hash,
			timestamp,
		),
	);

	if (options.chain) {
		options.chain.append(proof);
	}

	const proofTime = performance.now() - proofStart;
	const totalTime = performance.now() - totalStart;

	// Generate compliance report
	const proofHash = hashProof(proof);
	const report = generateReport(pack, allResults, fidelityScore, proofHash, timestamp);

	return {
		output,
		proof,
		valid: fidelityScore.passed,
		report,
		score: fidelityScore,
		events: options.audit !== false ? events : [],
		timing: {
			total: totalTime,
			aiCall: aiCallTime,
			governance: govPreTime + govPostTime,
			proof: proofTime,
		},
	};
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function resolvePack(governance: string | GovernancePack): GovernancePack {
	if (typeof governance === 'string') {
		return loadPack(governance);
	}
	return governance;
}

function extractFromMetadata(
	metadata: Record<string, unknown> | undefined,
	key: string,
): string | undefined {
	if (!metadata) return undefined;
	const val = metadata[key];
	if (typeof val === 'string') return val;
	if (val !== undefined && val !== null) return String(val);
	return undefined;
}

function determineEvaluationResult(results: RuleResult[]): 'PASS' | 'FAIL' | 'PARTIAL' {
	const applicable = results.filter((r) => r.result !== 'SKIP');
	if (applicable.length === 0) return 'PASS';

	const failed = applicable.filter((r) => r.result === 'FAIL');
	if (failed.length === 0) return 'PASS';

	const criticalFails = failed.filter((r) => r.severity === 'critical');
	if (criticalFails.length > 0) return 'FAIL';

	return 'PARTIAL';
}

async function handleCircuitBreak<T>(
	events: GovernanceEvent[],
	pack: GovernancePack,
	verifier: Verifier,
	preResults: RuleResult[],
	governancePolicyHash: ReturnType<typeof hashGovernancePack>,
	options: GovernOptions,
	timestamp: string,
	totalStart: number,
	govStart: number,
): Promise<GovernResult<T>> {
	events.push(
		createEvent(
			'CIRCUIT_BREAK',
			{
				reason: 'Critical pre-evaluation failure',
				failed_rules: preResults
					.filter((r) => r.result === 'FAIL' && r.severity === 'critical')
					.map((r) => r.rule_id),
			},
			events[events.length - 1]!.hash,
			timestamp,
		),
	);

	const fidelityScore = computeFidelityScore(preResults, pack.scoring);

	const systemStateHash = hashSystemState({
		pack: pack.name,
		version: pack.version,
		timestamp,
		circuit_break: true,
	});

	const proof = await generateProof({
		events,
		verifier,
		governancePolicyHash,
		systemStateHash,
		fidelityScore,
		evaluationResult: 'FAIL',
		subject: extractFromMetadata(options.metadata, 'subject') ?? 'ai-system',
		previousProof: options.chain?.getLastHash(),
		metadata: options.metadata,
		timestamp,
	});

	if (options.chain) {
		options.chain.append(proof);
	}

	const govTime = performance.now() - govStart;
	const totalTime = performance.now() - totalStart;

	const proofHash = hashProof(proof);
	const report = generateReport(pack, preResults, fidelityScore, proofHash, timestamp);

	return {
		output: undefined as T,
		proof,
		valid: false,
		report,
		score: fidelityScore,
		events: options.audit !== false ? events : [],
		timing: {
			total: totalTime,
			aiCall: 0,
			governance: govTime,
			proof: 0,
		},
	};
}
