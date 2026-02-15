/**
 * @brivora/verify — Rule evaluation engine
 *
 * Evaluates governance rules against context data.
 * All evaluators are predefined — governance packs cannot execute arbitrary code.
 * @module
 */

import type { EvalContext, GovernanceRule, RuleEvaluator, RuleResult } from './types.js';

// ─── PII Detection Patterns ────────────────────────────────────────────────

const PII_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
	{ name: 'ssn', pattern: /\b\d{3}-\d{2}-\d{4}\b/ },
	{ name: 'email', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/ },
	{
		name: 'phone',
		pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
	},
	{ name: 'credit_card', pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/ },
	{
		name: 'ip_address',
		pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
	},
];

// ─── Basic Toxicity Keywords ────────────────────────────────────────────────

const TOXICITY_KEYWORDS = [
	'kill',
	'murder',
	'attack',
	'bomb',
	'terrorist',
	'suicide',
	'weapon',
	'exploit',
	'hack',
	'destroy',
	'hate',
	'violence',
];

// ─── Custom Function Registry ───────────────────────────────────────────────

const customRegistry = new Map<string, (ctx: EvalContext) => RuleResult>();

export function registerCustomEvaluator(name: string, fn: (ctx: EvalContext) => RuleResult): void {
	customRegistry.set(name, fn);
}

// ─── Main Evaluation Function ───────────────────────────────────────────────

/**
 * Evaluate a single governance rule against the current context.
 */
export function evaluateRule(
	rule: GovernanceRule,
	ctx: EvalContext,
	phase: 'pre' | 'post',
): RuleResult {
	// Skip rules not applicable to this phase
	if (rule.phase !== 'both' && rule.phase !== phase) {
		return {
			rule_id: rule.id,
			rule_name: rule.name,
			severity: rule.severity,
			result: 'SKIP',
			message: `Rule not applicable in ${phase} phase`,
		};
	}

	try {
		return runEvaluator(rule.evaluate, rule, ctx);
	} catch (err) {
		return {
			rule_id: rule.id,
			rule_name: rule.name,
			severity: rule.severity,
			result: 'FAIL',
			message: `Evaluation error: ${err instanceof Error ? err.message : String(err)}`,
		};
	}
}

/**
 * Evaluate all rules in a governance pack for the given phase.
 */
export function evaluateRules(
	rules: GovernanceRule[],
	ctx: EvalContext,
	phase: 'pre' | 'post',
): RuleResult[] {
	return rules.map((rule) => evaluateRule(rule, ctx, phase));
}

// ─── Evaluator Dispatch ─────────────────────────────────────────────────────

function runEvaluator(
	evaluator: RuleEvaluator,
	rule: GovernanceRule,
	ctx: EvalContext,
): RuleResult {
	const base = { rule_id: rule.id, rule_name: rule.name, severity: rule.severity };

	switch (evaluator.type) {
		case 'required':
			return evalRequired(evaluator, base, ctx);
		case 'contains':
			return evalContains(evaluator, base, ctx);
		case 'regex':
			return evalRegex(evaluator, base, ctx);
		case 'length':
			return evalLength(evaluator, base, ctx);
		case 'model_allowlist':
			return evalModelAllowlist(evaluator, base, ctx);
		case 'model_blocklist':
			return evalModelBlocklist(evaluator, base, ctx);
		case 'token_limit':
			return evalTokenLimit(evaluator, base, ctx);
		case 'pii_detection':
			return evalPiiDetection(evaluator, base, ctx);
		case 'toxicity_threshold':
			return evalToxicityThreshold(evaluator, base, ctx);
		case 'bias_detection':
			return evalBiasDetection(evaluator, base, ctx);
		case 'custom':
			return evalCustom(evaluator, base, ctx);
		default:
			return { ...base, result: 'FAIL', message: `Unknown evaluator type` };
	}
}

// ─── Individual Evaluator Implementations ───────────────────────────────────

type BaseResult = { rule_id: string; rule_name: string; severity: GovernanceRule['severity'] };

function getFieldValue(ctx: EvalContext, field: string): unknown {
	return (ctx as unknown as Record<string, unknown>)[field];
}

function evalRequired(
	evaluator: Extract<RuleEvaluator, { type: 'required' }>,
	base: BaseResult,
	ctx: EvalContext,
): RuleResult {
	const missing: string[] = [];
	for (const field of evaluator.fields) {
		const val = getFieldValue(ctx, field);
		if (val === undefined || val === null || val === '') {
			missing.push(field);
		}
	}
	if (missing.length > 0) {
		return {
			...base,
			result: 'FAIL',
			message: `Missing required fields: ${missing.join(', ')}`,
			evidence: { missing },
		};
	}
	return { ...base, result: 'PASS', message: 'All required fields present' };
}

function evalContains(
	evaluator: Extract<RuleEvaluator, { type: 'contains' }>,
	base: BaseResult,
	ctx: EvalContext,
): RuleResult {
	const val = getFieldValue(ctx, evaluator.field);
	const str = typeof val === 'string' ? val : JSON.stringify(val ?? '');
	const found = evaluator.values.some((v) => str.includes(v));
	const pass = evaluator.negate ? !found : found;
	return {
		...base,
		result: pass ? 'PASS' : 'FAIL',
		message: pass
			? `Field "${evaluator.field}" contains expected values`
			: `Field "${evaluator.field}" ${evaluator.negate ? 'contains prohibited' : 'missing expected'} values`,
		evidence: { field: evaluator.field, values: evaluator.values, found },
	};
}

function evalRegex(
	evaluator: Extract<RuleEvaluator, { type: 'regex' }>,
	base: BaseResult,
	ctx: EvalContext,
): RuleResult {
	const val = getFieldValue(ctx, evaluator.field);
	const str = typeof val === 'string' ? val : JSON.stringify(val ?? '');
	const re = new RegExp(evaluator.pattern);
	const matches = re.test(str);
	const pass = evaluator.negate ? !matches : matches;
	return {
		...base,
		result: pass ? 'PASS' : 'FAIL',
		message: pass
			? `Field "${evaluator.field}" matches pattern`
			: `Field "${evaluator.field}" does not match pattern`,
		evidence: { field: evaluator.field, pattern: evaluator.pattern, matches },
	};
}

function evalLength(
	evaluator: Extract<RuleEvaluator, { type: 'length' }>,
	base: BaseResult,
	ctx: EvalContext,
): RuleResult {
	const val = getFieldValue(ctx, evaluator.field);
	const str = typeof val === 'string' ? val : JSON.stringify(val ?? '');
	const len = str.length;
	const minOk = evaluator.min === undefined || len >= evaluator.min;
	const maxOk = evaluator.max === undefined || len <= evaluator.max;
	const pass = minOk && maxOk;
	return {
		...base,
		result: pass ? 'PASS' : 'FAIL',
		message: pass
			? `Field "${evaluator.field}" length ${len} within bounds`
			: `Field "${evaluator.field}" length ${len} out of bounds (min: ${evaluator.min}, max: ${evaluator.max})`,
		evidence: { field: evaluator.field, length: len, min: evaluator.min, max: evaluator.max },
	};
}

function evalModelAllowlist(
	evaluator: Extract<RuleEvaluator, { type: 'model_allowlist' }>,
	base: BaseResult,
	ctx: EvalContext,
): RuleResult {
	const model = ctx.model ?? '';
	const pass = evaluator.models.includes(model);
	return {
		...base,
		result: pass ? 'PASS' : 'FAIL',
		message: pass
			? `Model "${model}" is in the allowlist`
			: `Model "${model}" is not in the allowlist`,
		evidence: { model, allowlist: evaluator.models },
	};
}

function evalModelBlocklist(
	evaluator: Extract<RuleEvaluator, { type: 'model_blocklist' }>,
	base: BaseResult,
	ctx: EvalContext,
): RuleResult {
	const model = ctx.model ?? '';
	const blocked = evaluator.models.includes(model);
	return {
		...base,
		result: blocked ? 'FAIL' : 'PASS',
		message: blocked ? `Model "${model}" is blocklisted` : `Model "${model}" is not blocklisted`,
		evidence: { model, blocklist: evaluator.models },
	};
}

function evalTokenLimit(
	evaluator: Extract<RuleEvaluator, { type: 'token_limit' }>,
	base: BaseResult,
	ctx: EvalContext,
): RuleResult {
	// Rough token estimation: ~4 chars per token
	const promptLen = typeof ctx.prompt === 'string' ? ctx.prompt.length : 0;
	const responseLen = typeof ctx.response === 'string' ? (ctx.response as string).length : 0;
	const estInputTokens = Math.ceil(promptLen / 4);
	const estOutputTokens = Math.ceil(responseLen / 4);

	const inputOk = evaluator.max_input === undefined || estInputTokens <= evaluator.max_input;
	const outputOk = evaluator.max_output === undefined || estOutputTokens <= evaluator.max_output;
	const pass = inputOk && outputOk;

	return {
		...base,
		result: pass ? 'PASS' : 'FAIL',
		message: pass
			? 'Token usage within limits'
			: `Token limit exceeded (input: ~${estInputTokens}, output: ~${estOutputTokens})`,
		evidence: {
			estimated_input_tokens: estInputTokens,
			estimated_output_tokens: estOutputTokens,
			max_input: evaluator.max_input,
			max_output: evaluator.max_output,
		},
	};
}

function evalPiiDetection(
	evaluator: Extract<RuleEvaluator, { type: 'pii_detection' }>,
	base: BaseResult,
	ctx: EvalContext,
): RuleResult {
	const detections: Array<{ field: string; type: string }> = [];

	for (const field of evaluator.fields) {
		const val = getFieldValue(ctx, field);
		const str = typeof val === 'string' ? val : JSON.stringify(val ?? '');
		for (const pii of PII_PATTERNS) {
			if (pii.pattern.test(str)) {
				detections.push({ field, type: pii.name });
			}
		}
	}

	if (detections.length === 0) {
		return { ...base, result: 'PASS', message: 'No PII detected' };
	}

	// Action determines severity: 'block' → FAIL, 'flag'/'redact' → PASS with evidence
	if (evaluator.action === 'block') {
		return {
			...base,
			result: 'FAIL',
			message: `PII detected and blocked: ${detections.map((d) => `${d.type} in ${d.field}`).join(', ')}`,
			evidence: { detections, action: evaluator.action },
		};
	}

	return {
		...base,
		result: 'PASS',
		message: `PII detected and flagged: ${detections.map((d) => `${d.type} in ${d.field}`).join(', ')}`,
		evidence: { detections, action: evaluator.action },
	};
}

function evalToxicityThreshold(
	evaluator: Extract<RuleEvaluator, { type: 'toxicity_threshold' }>,
	base: BaseResult,
	ctx: EvalContext,
): RuleResult {
	// Basic keyword-based toxicity scoring (v1 stub)
	const text = [ctx.prompt ?? '', typeof ctx.response === 'string' ? ctx.response : '']
		.join(' ')
		.toLowerCase();
	const words = text.split(/\s+/);
	const totalWords = Math.max(words.length, 1);

	let toxicCount = 0;
	for (const word of words) {
		if (TOXICITY_KEYWORDS.some((kw) => word.includes(kw))) {
			toxicCount++;
		}
	}

	const score = Math.min(toxicCount / totalWords, 1.0);
	const pass = score <= evaluator.max_score;

	return {
		...base,
		result: pass ? 'PASS' : 'FAIL',
		message: pass
			? `Toxicity score ${score.toFixed(3)} within threshold ${evaluator.max_score}`
			: `Toxicity score ${score.toFixed(3)} exceeds threshold ${evaluator.max_score}`,
		evidence: { score, threshold: evaluator.max_score, method: 'keyword-basic-v1' },
	};
}

function evalBiasDetection(
	evaluator: Extract<RuleEvaluator, { type: 'bias_detection' }>,
	base: BaseResult,
	ctx: EvalContext,
): RuleResult {
	// Basic bias detection stub (v1): check if protected attributes are mentioned
	const text = [ctx.prompt ?? '', typeof ctx.response === 'string' ? ctx.response : '']
		.join(' ')
		.toLowerCase();

	const mentioned = evaluator.protected_attributes.filter((attr) =>
		text.includes(attr.toLowerCase()),
	);

	if (mentioned.length > 0) {
		return {
			...base,
			result: 'PASS', // Flag only, don't fail — bias detection needs ML models for accuracy
			message: `Protected attributes mentioned: ${mentioned.join(', ')}. Manual review recommended.`,
			evidence: {
				mentioned,
				protected_attributes: evaluator.protected_attributes,
				method: 'keyword-basic-v1',
			},
		};
	}

	return {
		...base,
		result: 'PASS',
		message: 'No protected attributes detected',
		evidence: {
			protected_attributes: evaluator.protected_attributes,
			method: 'keyword-basic-v1',
		},
	};
}

function evalCustom(
	evaluator: Extract<RuleEvaluator, { type: 'custom' }>,
	base: BaseResult,
	ctx: EvalContext,
): RuleResult {
	const fn = customRegistry.get(evaluator.fn);
	if (!fn) {
		return {
			...base,
			result: 'FAIL',
			message: `Custom evaluator "${evaluator.fn}" not found in registry`,
		};
	}
	return fn(ctx);
}
