import { describe, it, expect } from 'vitest';
import { createChain, verifyChain } from '../src/chain.js';
import { generateProof, hashProof } from '../src/proof.js';
import { createEventChain, hashGovernancePack, hashSystemState } from '../src/events.js';
import { createVerifier } from '../src/verifier.js';
import type { BrivoraProof, FidelityScore } from '../src/types.js';

const TS = '2026-01-01T00:00:00.000Z';

function makeScore(): FidelityScore {
	return { overall: 0.9, dimensions: {}, threshold: 0.7, passed: true };
}

async function makeProof(
	verifier: Awaited<ReturnType<typeof createVerifier>>,
	previousProof?: ReturnType<typeof hashProof>,
	idx = 0,
): Promise<BrivoraProof> {
	const events = createEventChain(
		[{ type: 'GOVERNANCE_LOADED', data: { idx } }],
		TS,
	);
	return generateProof({
		events,
		verifier,
		governancePolicyHash: hashGovernancePack({ name: 'test', version: '1.0.0', rules: [{ id: 'r1' }] }),
		systemStateHash: hashSystemState({ idx }),
		fidelityScore: makeScore(),
		evaluationResult: 'PASS',
		previousProof,
		timestamp: TS,
	});
}

describe('proof chaining', () => {
	describe('createChain', () => {
		it('creates a chain with no initial hash', async () => {
			const verifier = await createVerifier();
			const chain = createChain(verifier);
			expect(chain.getLastHash()).toBeUndefined();
		});

		it('tracks the last proof hash after append', async () => {
			const verifier = await createVerifier();
			const chain = createChain(verifier);
			const proof = await makeProof(verifier);

			chain.append(proof);
			const lastHash = chain.getLastHash();
			expect(lastHash).toBeDefined();
			expect(lastHash!.algorithm).toBe('sha3-256');
		});
	});

	describe('verifyChain', () => {
		it('verifies an empty chain', async () => {
			const verifier = await createVerifier();
			const result = await verifyChain([], verifier.publicKey);
			expect(result.valid).toBe(true);
			expect(result.length).toBe(0);
		});

		it('verifies a single proof chain', async () => {
			const verifier = await createVerifier();
			const proof = await makeProof(verifier);
			const result = await verifyChain([proof], verifier.publicKey);
			expect(result.valid).toBe(true);
			expect(result.length).toBe(1);
		});

		it('verifies a chain of 5 linked proofs', async () => {
			const verifier = await createVerifier();
			const proofs: BrivoraProof[] = [];

			for (let i = 0; i < 5; i++) {
				const prevHash = proofs.length > 0 ? hashProof(proofs[proofs.length - 1]!) : undefined;
				const proof = await makeProof(verifier, prevHash, i);
				proofs.push(proof);
			}

			const result = await verifyChain(proofs, verifier.publicKey);
			expect(result.valid).toBe(true);
			expect(result.chain_integrity).toBe(true);
			expect(result.length).toBe(5);
			expect(result.proofs.every((p) => p.valid)).toBe(true);
		});

		it('detects a broken chain link', async () => {
			const verifier = await createVerifier();
			const proofs: BrivoraProof[] = [];

			for (let i = 0; i < 3; i++) {
				const prevHash = proofs.length > 0 ? hashProof(proofs[proofs.length - 1]!) : undefined;
				const proof = await makeProof(verifier, prevHash, i);
				proofs.push(proof);
			}

			// Tamper: remove the chain link from the middle proof
			const tampered = [...proofs];
			tampered[1] = { ...tampered[1]!, previous_proof: undefined };

			const result = await verifyChain(tampered, verifier.publicKey);
			expect(result.chain_integrity).toBe(false);
		});

		it('detects wrong public key in chain', async () => {
			const verifier = await createVerifier();
			const wrongVerifier = await createVerifier();
			const proof = await makeProof(verifier);

			const result = await verifyChain([proof], wrongVerifier.publicKey);
			expect(result.valid).toBe(false);
			expect(result.proofs[0]!.valid).toBe(false);
		});
	});
});
