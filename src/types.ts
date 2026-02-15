/**
 * @brivora/verify — Type definitions
 *
 * All interfaces and types for the governance verification system.
 * @module
 */

import type { HybridPrivateKey, HybridPublicKey, SignedPayload } from '@brivora/crypto';

// ─── Content Hash ───────────────────────────────────────────────────────────

export interface ContentHash {
	algorithm: 'sha3-256';
	value: string; // hex-encoded
}

// ─── Fidelity Score ─────────────────────────────────────────────────────────

export interface FidelityScore {
	overall: number; // 0.0 - 1.0
	dimensions: Record<string, number>; // per-dimension scores
	threshold: number; // minimum passing score
	passed: boolean; // overall >= threshold
}

// ─── Governance Events ──────────────────────────────────────────────────────

export type GovernanceEventType =
	| 'GOVERNANCE_LOADED'
	| 'PROMPT_RECEIVED'
	| 'PRE_EVALUATION'
	| 'MODEL_INVOCATION'
	| 'RESPONSE_RECEIVED'
	| 'POST_EVALUATION'
	| 'FIDELITY_SCORE'
	| 'PROOF_GENERATED'
	| 'GOVERNANCE_VIOLATION'
	| 'CIRCUIT_BREAK';

export interface GovernanceEvent {
	type: GovernanceEventType;
	timestamp: string; // ISO-8601
	hash: ContentHash; // hash of this event's data
	data: Record<string, unknown>; // event-specific data
	parent_hash?: ContentHash; // hash of previous event (chain within proof)
}

// ─── Proof Signature ────────────────────────────────────────────────────────

export interface ProofSignature {
	algorithm: 'hybrid-pqc-v1' | 'ml-dsa-65';
	classical?: Uint8Array; // Ed25519 signature (hybrid mode)
	pqc: Uint8Array; // ML-DSA-65 signature
}

// ─── Brivora Proof ──────────────────────────────────────────────────────────

export interface BrivoraProof {
	version: '1.0';
	timestamp: string; // ISO-8601
	subject: string; // DID or identifier of the AI system
	verifier: string; // fingerprint of the verification engine
	governance_policy: ContentHash; // hash of the governance pack used
	system_state_hash: ContentHash; // hash of system state at evaluation
	fidelity_score: FidelityScore;
	evaluation_result: 'PASS' | 'FAIL' | 'PARTIAL';
	evidence_chain: ContentHash[]; // ordered hashes of each event
	merkle_root: ContentHash; // root of the Merkle tree
	signature: ProofSignature; // ML-DSA-65 + Ed25519 hybrid signature
	public_key: Uint8Array; // verifier's encoded public key (self-contained)
	previous_proof?: ContentHash; // link to previous proof in chain
	metadata?: Record<string, unknown>; // user-defined metadata
}

// ─── Verify Result ──────────────────────────────────────────────────────────

export interface VerifyResult {
	valid: boolean; // signature verifies AND merkle root matches
	proof: BrivoraProof; // the proof that was verified
	governance_policy: ContentHash; // which governance was applied
	evaluation_result: 'PASS' | 'FAIL' | 'PARTIAL';
	timestamp: string;
	chain_valid?: boolean; // if previous_proof exists, did it verify?
}

// ─── Rule Evaluators ────────────────────────────────────────────────────────

export type RuleEvaluator =
	| { type: 'contains'; field: string; values: string[]; negate?: boolean }
	| { type: 'regex'; field: string; pattern: string; negate?: boolean }
	| { type: 'length'; field: string; min?: number; max?: number }
	| { type: 'required'; fields: string[] }
	| { type: 'model_allowlist'; models: string[] }
	| { type: 'model_blocklist'; models: string[] }
	| { type: 'token_limit'; max_input?: number; max_output?: number }
	| { type: 'pii_detection'; fields: string[]; action: 'flag' | 'redact' | 'block' }
	| { type: 'toxicity_threshold'; max_score: number }
	| { type: 'bias_detection'; protected_attributes: string[] }
	| { type: 'custom'; fn: string };

// ─── Governance Rules ───────────────────────────────────────────────────────

export interface GovernanceRule {
	id: string;
	name: string;
	description: string;
	phase: 'pre' | 'post' | 'both';
	severity: 'critical' | 'high' | 'medium' | 'low';
	evaluate: RuleEvaluator;
}

// ─── Scoring Config ─────────────────────────────────────────────────────────

export interface ScoringDimension {
	name: string;
	rules: string[]; // rule IDs that contribute to this dimension
}

export interface ScoringConfig {
	dimensions: ScoringDimension[];
	threshold: number; // overall passing score (0.0 - 1.0)
	weights: Record<string, number>; // dimension weights (must sum to 1.0)
}

// ─── Governance Pack ────────────────────────────────────────────────────────

export interface GovernancePack {
	name: string;
	version: string; // semver
	description: string;
	rules: GovernanceRule[];
	scoring: ScoringConfig;
	metadata: Record<string, unknown>;
}

export type PackDefinition = Omit<GovernancePack, 'metadata'> & {
	metadata?: Record<string, unknown>;
};

// ─── Rule Result ────────────────────────────────────────────────────────────

export interface RuleResult {
	rule_id: string;
	rule_name: string;
	severity: 'critical' | 'high' | 'medium' | 'low';
	result: 'PASS' | 'FAIL' | 'SKIP';
	message?: string;
	evidence?: Record<string, unknown>;
}

// ─── Compliance Report ──────────────────────────────────────────────────────

export interface ComplianceReport {
	timestamp: string;
	governance_pack: string;
	governance_version: string;
	overall_result: 'PASS' | 'FAIL' | 'PARTIAL';
	fidelity_score: FidelityScore;
	rule_results: RuleResult[];
	recommendations: string[];
	proof_hash: ContentHash;
}

// ─── Verifier ───────────────────────────────────────────────────────────────

export interface Verifier {
	publicKey: HybridPublicKey;
	privateKey: HybridPrivateKey;
	fingerprint: string;
	encodedPublicKey: Uint8Array; // length-prefixed encoded public keys
	sign(data: Uint8Array): Promise<SignedPayload>;
}

export interface VerifierOptions {
	existingIdentity?: {
		publicKey: HybridPublicKey;
		privateKey: HybridPrivateKey;
		fingerprint: string;
	};
}

// ─── Evaluation Context ─────────────────────────────────────────────────────

export interface EvalContext {
	prompt?: string;
	model?: string;
	parameters?: Record<string, unknown>;
	response?: unknown;
	timing?: { aiCall: number };
	fidelity_score?: FidelityScore;
	evaluation_result?: 'PASS' | 'FAIL' | 'PARTIAL';
	governance_result?: Record<string, unknown>;
	ruleResults: RuleResult[];
}

// ─── Govern Options ─────────────────────────────────────────────────────────

export interface GovernOptions {
	governance: string | GovernancePack; // pack name or loaded pack
	audit?: boolean; // enable detailed event capture (default: true)
	verifier?: Verifier; // signing identity
	chain?: ProofChain; // link to previous proofs
	metadata?: Record<string, unknown>;
	onPreEval?: (ctx: EvalContext) => void;
	onPostEval?: (ctx: EvalContext) => void;
	timeout?: number; // max ms for the AI call (default: 30000)
}

// ─── Govern Result ──────────────────────────────────────────────────────────

export interface GovernResult<T> {
	output: T; // the AI call's return value (passthrough)
	proof: BrivoraProof; // cryptographic governance proof
	valid: boolean; // did all governance checks pass?
	report: ComplianceReport; // human-readable compliance report
	score: FidelityScore; // composite governance score
	events: GovernanceEvent[]; // full event chain (if audit: true)
	timing: {
		total: number; // total ms including governance overhead
		aiCall: number; // ms for the AI call alone
		governance: number; // ms for governance evaluation
		proof: number; // ms for proof generation
	};
}

// ─── Proof Chain ────────────────────────────────────────────────────────────

export interface ProofChain {
	verifier: Verifier;
	lastProofHash?: ContentHash;
	append(proof: BrivoraProof): void;
	getLastHash(): ContentHash | undefined;
}

export interface ChainVerifyResult {
	valid: boolean;
	proofs: Array<{ proof: BrivoraProof; valid: boolean }>;
	chain_integrity: boolean; // all previous_proof links valid?
	length: number;
}

// ─── Audit Store ────────────────────────────────────────────────────────────

export interface AuditStore {
	save(proof: BrivoraProof): Promise<void>;
	load(hash: ContentHash): Promise<BrivoraProof | null>;
	list(options?: { limit?: number; offset?: number }): Promise<BrivoraProof[]>;
	chain(options?: { from?: ContentHash }): Promise<BrivoraProof[]>;
}

export interface AuditStoreOptions {
	type: 'file' | 'memory' | 'custom';
	path?: string; // for 'file' type
	adapter?: AuditStore; // for 'custom' type
}
