/**
 * @brivora/verify — Merkle tree and proof generation
 *
 * Builds a SHA-3-256 Merkle tree from governance events and signs the root.
 * This is the core cryptographic component — proofs are independently verifiable
 * by anyone with just the proof and a public key.
 *
 * @module
 */

import type { SignedPayload } from '@brivora/crypto';
import { crypto } from '@brivora/crypto';
import type {
	BrivoraProof,
	ContentHash,
	FidelityScore,
	GovernanceEvent,
	ProofSignature,
	Verifier,
} from './types.js';
import { bytesToHex, concatBytes, hexToBytes } from './utils.js';

// ─── Merkle Tree ────────────────────────────────────────────────────────────

/**
 * Compute the SHA-3-256 hash of two concatenated hashes (internal Merkle node).
 */
function hashPair(left: Uint8Array, right: Uint8Array): Uint8Array {
	return crypto.hash(concatBytes(left, right), 'sha3-256');
}

/**
 * Build a Merkle tree from leaf hashes and return the root hash.
 * If odd number of leaves, the last leaf is duplicated.
 * Returns the zero hash for empty input.
 */
export function computeMerkleRoot(leafHashes: ContentHash[]): ContentHash {
	if (leafHashes.length === 0) {
		// Empty tree → hash of empty string
		const emptyHash = crypto.hash(new Uint8Array(0), 'sha3-256');
		return { algorithm: 'sha3-256', value: bytesToHex(emptyHash) };
	}

	// Convert hex strings to byte arrays
	let level: Uint8Array[] = leafHashes.map((h) => hexToBytes(h.value));

	// Build tree bottom-up
	while (level.length > 1) {
		const nextLevel: Uint8Array[] = [];
		for (let i = 0; i < level.length; i += 2) {
			const left = level[i]!;
			// If odd, duplicate the last element
			const right = i + 1 < level.length ? level[i + 1]! : left;
			nextLevel.push(hashPair(left, right));
		}
		level = nextLevel;
	}

	return { algorithm: 'sha3-256', value: bytesToHex(level[0]!) };
}

/**
 * Verify that a Merkle root matches the given leaf hashes.
 * Recomputes the tree and compares roots.
 */
export function verifyMerkleRoot(leafHashes: ContentHash[], expectedRoot: ContentHash): boolean {
	const computed = computeMerkleRoot(leafHashes);
	return computed.value === expectedRoot.value;
}

// ─── Proof Generation ───────────────────────────────────────────────────────

export interface GenerateProofOptions {
	events: GovernanceEvent[];
	verifier: Verifier;
	governancePolicyHash: ContentHash;
	systemStateHash: ContentHash;
	fidelityScore: FidelityScore;
	evaluationResult: 'PASS' | 'FAIL' | 'PARTIAL';
	subject?: string;
	previousProof?: ContentHash;
	metadata?: Record<string, unknown>;
	timestamp?: string;
}

/**
 * Generate a BrivoraProof from governance events.
 *
 * 1. Extract leaf hashes from events (evidence_chain)
 * 2. Build Merkle tree → compute root
 * 3. Sign the root with the verifier's key
 * 4. Assemble the complete proof
 */
export async function generateProof(options: GenerateProofOptions): Promise<BrivoraProof> {
	const {
		events,
		verifier,
		governancePolicyHash,
		systemStateHash,
		fidelityScore,
		evaluationResult,
		subject = 'ai-system',
		previousProof,
		metadata,
		timestamp,
	} = options;

	// Step 1: Extract evidence chain (ordered event hashes)
	const evidenceChain = events.map((e) => e.hash);

	// Step 2: Compute Merkle root
	const merkleRoot = computeMerkleRoot(evidenceChain);

	// Step 3: Sign the Merkle root
	const rootBytes = hexToBytes(merkleRoot.value);
	const signedPayload = await verifier.sign(rootBytes);

	// Step 4: Extract signature components
	const signature = extractSignature(signedPayload);

	// Step 5: Assemble proof
	const proof: BrivoraProof = {
		version: '1.0',
		timestamp: timestamp ?? new Date().toISOString(),
		subject,
		verifier: verifier.fingerprint,
		governance_policy: governancePolicyHash,
		system_state_hash: systemStateHash,
		fidelity_score: fidelityScore,
		evaluation_result: evaluationResult,
		evidence_chain: evidenceChain,
		merkle_root: merkleRoot,
		signature,
		public_key: verifier.encodedPublicKey,
		previous_proof: previousProof,
		metadata,
	};

	return proof;
}

/**
 * Extract ProofSignature from a SignedPayload.
 */
function extractSignature(signed: SignedPayload): ProofSignature {
	return {
		algorithm: signed.algorithm as 'hybrid-pqc-v1' | 'ml-dsa-65',
		classical: signed.classical,
		pqc: signed.pqc,
	};
}

// ─── Proof Verification ─────────────────────────────────────────────────────

/**
 * Reconstruct a SignedPayload from proof fields for verification.
 */
function reconstructSignedPayload(proof: BrivoraProof): SignedPayload {
	return {
		version: 1,
		algorithm: proof.signature.algorithm,
		data: hexToBytes(proof.merkle_root.value),
		classical: proof.signature.classical,
		pqc: proof.signature.pqc,
		publicKey: proof.public_key,
	};
}

/**
 * Verify a BrivoraProof independently.
 *
 * 1. Recompute Merkle root from evidence_chain
 * 2. Compare to claimed merkle_root
 * 3. Verify the signature on the Merkle root
 *
 * Requires only the proof and (optionally) a public key. No state. No API. Pure math.
 */
export async function verifyProof(
	proof: BrivoraProof,
	publicKey?: import('@brivora/crypto').HybridPublicKey,
): Promise<{ valid: boolean; merkleValid: boolean; signatureValid: boolean }> {
	// Step 1: Recompute Merkle root from evidence chain
	const computedRoot = computeMerkleRoot(proof.evidence_chain);
	const merkleValid = computedRoot.value === proof.merkle_root.value;

	if (!merkleValid) {
		return { valid: false, merkleValid: false, signatureValid: false };
	}

	// Step 2: Reconstruct the signed payload
	const signedPayload = reconstructSignedPayload(proof);

	// Step 3: Verify the signature using @brivora/crypto
	const result = await crypto.verify(signedPayload, publicKey);

	return {
		valid: merkleValid && result.valid,
		merkleValid,
		signatureValid: result.valid,
	};
}

/**
 * Compute the hash of a proof (for chaining and storage).
 */
export function hashProof(proof: BrivoraProof): ContentHash {
	// Hash the merkle root + signature + timestamp for uniqueness
	const data = JSON.stringify({
		merkle_root: proof.merkle_root.value,
		timestamp: proof.timestamp,
		verifier: proof.verifier,
		evaluation_result: proof.evaluation_result,
	});
	const digest = crypto.hash(data, 'sha3-256');
	return { algorithm: 'sha3-256', value: bytesToHex(digest) };
}
