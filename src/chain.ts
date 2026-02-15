/**
 * @brivora/verify — Proof chaining
 *
 * Links sequential proofs together via previous_proof hashes,
 * creating a tamper-evident chain of governance decisions.
 * @module
 */

import type { HybridPublicKey } from '@brivora/crypto';
import { hashProof, verifyProof } from './proof.js';
import type {
	BrivoraProof,
	ChainVerifyResult,
	ContentHash,
	ProofChain,
	Verifier,
} from './types.js';

/**
 * Create a proof chain for linking sequential proofs.
 */
export function createChain(verifier: Verifier): ProofChain {
	let lastProofHash: ContentHash | undefined;

	return {
		verifier,
		get lastProofHash() {
			return lastProofHash;
		},
		append(proof: BrivoraProof): void {
			lastProofHash = hashProof(proof);
		},
		getLastHash(): ContentHash | undefined {
			return lastProofHash;
		},
	};
}

/**
 * Verify an entire chain of proofs.
 *
 * Checks:
 * 1. Each proof's Merkle root and signature are valid
 * 2. Each proof's previous_proof hash matches the hash of the preceding proof
 * 3. The first proof has no previous_proof (or it's the chain start)
 */
export async function verifyChain(
	proofs: BrivoraProof[],
	publicKey: HybridPublicKey,
): Promise<ChainVerifyResult> {
	if (proofs.length === 0) {
		return {
			valid: true,
			proofs: [],
			chain_integrity: true,
			length: 0,
		};
	}

	const results: Array<{ proof: BrivoraProof; valid: boolean }> = [];
	let chainIntegrity = true;

	for (let i = 0; i < proofs.length; i++) {
		const proof = proofs[i]!;

		// Verify individual proof
		const proofResult = await verifyProof(proof, publicKey);
		results.push({ proof, valid: proofResult.valid });

		// Verify chain link (except first proof)
		if (i > 0) {
			const prevProof = proofs[i - 1]!;
			const expectedPrevHash = hashProof(prevProof);

			if (!proof.previous_proof) {
				chainIntegrity = false;
			} else if (proof.previous_proof.value !== expectedPrevHash.value) {
				chainIntegrity = false;
			}
		}
	}

	const allValid = results.every((r) => r.valid);

	return {
		valid: allValid && chainIntegrity,
		proofs: results,
		chain_integrity: chainIntegrity,
		length: proofs.length,
	};
}
