/**
 * @brivora/verify — Main facade
 *
 * The primary API surface. verify.govern() wraps any AI call with governance.
 * verify.check() independently verifies a proof.
 *
 * @module
 */

import type { HybridPublicKey } from '@brivora/crypto';
import { createAuditStore as _createAuditStore } from './audit.js';
import { createChain as _createChain, verifyChain as _verifyChain } from './chain.js';
import {
	createPack as _createPack,
	listPacks as _listPacks,
	loadPack as _loadPack,
	loadPackFromFile as _loadPackFromFile,
} from './pack.js';
import { runPipeline } from './pipeline.js';
import { hashProof, verifyProof } from './proof.js';
import type {
	AuditStore,
	AuditStoreOptions,
	BrivoraProof,
	ChainVerifyResult,
	GovernancePack,
	GovernOptions,
	GovernResult,
	PackDefinition,
	ProofChain,
	Verifier,
	VerifierOptions,
	VerifyResult,
} from './types.js';
import { createVerifier as _createVerifier } from './verifier.js';

/**
 * The verify facade — the public API of @brivora/verify.
 */
export const verify = {
	// ═══ CORE ═══

	/**
	 * Wrap any AI call with governance verification.
	 *
	 * @example
	 * ```ts
	 * const result = await verify.govern(
	 *   () => anthropic.messages.create({ model: 'claude-opus-4-6', messages: [...] }),
	 *   { governance: 'eu-ai-act-v1', audit: true }
	 * );
	 * ```
	 */
	async govern<T>(fn: () => Promise<T>, options: GovernOptions): Promise<GovernResult<T>> {
		return runPipeline(fn, options);
	},

	/**
	 * Verify a proof independently. Requires only the proof and a public key.
	 * No API call. No database. No Brivora account. Pure math.
	 */
	async check(proof: BrivoraProof, publicKey: HybridPublicKey): Promise<VerifyResult> {
		const result = await verifyProof(proof, publicKey);
		return {
			valid: result.valid,
			proof,
			governance_policy: proof.governance_policy,
			evaluation_result: proof.evaluation_result,
			timestamp: proof.timestamp,
		};
	},

	// ═══ IDENTITY ═══

	/**
	 * Create a new verifier identity (key pair for signing proofs).
	 */
	async createVerifier(options?: VerifierOptions): Promise<Verifier> {
		return _createVerifier(options);
	},

	// ═══ GOVERNANCE PACKS ═══

	/**
	 * Load a built-in governance pack by name.
	 */
	loadPack(name: string): GovernancePack {
		return _loadPack(name);
	},

	/**
	 * Load a custom governance pack from a JSON file.
	 */
	async loadPackFromFile(path: string): Promise<GovernancePack> {
		return _loadPackFromFile(path);
	},

	/**
	 * Create a governance pack programmatically.
	 */
	createPack(definition: PackDefinition): GovernancePack {
		return _createPack(definition);
	},

	/**
	 * List all available built-in governance pack names.
	 */
	listPacks(): string[] {
		return _listPacks();
	},

	// ═══ AUDIT ═══

	/**
	 * Create an audit store for persisting proofs.
	 */
	createAuditStore(options: AuditStoreOptions): AuditStore {
		return _createAuditStore(options);
	},

	// ═══ PROOF CHAIN ═══

	/**
	 * Create a proof chain for linking sequential proofs.
	 */
	createChain(verifier: Verifier): ProofChain {
		return _createChain(verifier);
	},

	/**
	 * Verify an entire chain of proofs.
	 */
	async checkChain(proofs: BrivoraProof[], publicKey: HybridPublicKey): Promise<ChainVerifyResult> {
		return _verifyChain(proofs, publicKey);
	},

	/**
	 * Compute the hash of a proof (for reference/storage).
	 */
	hashProof(proof: BrivoraProof) {
		return hashProof(proof);
	},
};
