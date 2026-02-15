/**
 * @brivora/verify — 5 lines of code to make any AI call verifiable.
 *
 * @example
 * ```ts
 * import { verify } from '@brivora/verify';
 *
 * const result = await verify.govern(
 *   () => anthropic.messages.create({
 *     model: 'claude-opus-4-6',
 *     messages: [{ role: 'user', content: 'Analyze this loan application' }]
 *   }),
 *   { governance: 'eu-ai-act-v1', audit: true }
 * );
 *
 * console.log(result.output);  // The AI response
 * console.log(result.proof);   // PQC-signed Merkle root
 * console.log(result.valid);   // true
 * console.log(result.report);  // Compliance report
 * console.log(result.score);   // Fidelity score 0.0-1.0
 * ```
 *
 * @packageDocumentation
 */

export { createAuditStore } from './audit.js';
export { createChain, verifyChain } from './chain.js';
export { evaluateRule, evaluateRules, registerCustomEvaluator } from './evaluator.js';
export { createEvent, createEventChain, hashGovernancePack, hashSystemState } from './events.js';
export { createPack, listPacks, loadPack, loadPackFromFile } from './pack.js';
export { runPipeline } from './pipeline.js';
export {
	computeMerkleRoot,
	generateProof,
	hashProof,
	verifyMerkleRoot,
	verifyProof,
} from './proof.js';
export { generateReport } from './report.js';
export { computeFidelityScore } from './score.js';
// Types
export type {
	AuditStore,
	AuditStoreOptions,
	BrivoraProof,
	ChainVerifyResult,
	ComplianceReport,
	ContentHash,
	EvalContext,
	FidelityScore,
	GovernanceEvent,
	GovernanceEventType,
	GovernancePack,
	GovernanceRule,
	GovernOptions,
	GovernResult,
	PackDefinition,
	ProofChain,
	ProofSignature,
	RuleEvaluator,
	RuleResult,
	ScoringConfig,
	ScoringDimension,
	Verifier,
	VerifierOptions,
	VerifyResult,
} from './types.js';
// Individual modules (for tree-shaking)
export { createVerifier, loadVerifier } from './verifier.js';
// Main facade
export { verify } from './verify.js';
