import { describe, it, expect } from 'vitest';
import { verify } from '../src/verify.js';
import { createVerifier } from '../src/verifier.js';
import { generateProof, hashProof } from '../src/proof.js';
import { createEventChain, hashGovernancePack, hashSystemState } from '../src/events.js';

const TS = '2026-01-01T00:00:00.000Z';

describe('verify.check — independent proof verification', () => {
	it('verifies a valid proof with the correct public key', async () => {
		const verifier = await createVerifier();
		const events = createEventChain([
			{ type: 'GOVERNANCE_LOADED', data: { pack: 'eu-ai-act-v1' } },
			{ type: 'PROMPT_RECEIVED', data: { prompt: 'test' } },
			{ type: 'POST_EVALUATION', data: { result: 'PASS' } },
		], TS);

		const proof = await generateProof({
			events,
			verifier,
			governancePolicyHash: hashGovernancePack({ name: 'eu-ai-act-v1', version: '1.0.0', rules: [{ id: 'r1' }] }),
			systemStateHash: hashSystemState({ test: true }),
			fidelityScore: { overall: 0.95, dimensions: {}, threshold: 0.7, passed: true },
			evaluationResult: 'PASS',
			timestamp: TS,
		});

		const result = await verify.check(proof, verifier.publicKey);
		expect(result.valid).toBe(true);
		expect(result.evaluation_result).toBe('PASS');
		expect(result.timestamp).toBe(TS);
		expect(result.governance_policy.algorithm).toBe('sha3-256');
	});

	it('rejects a proof signed by a different key', async () => {
		const verifier = await createVerifier();
		const attacker = await createVerifier();

		const events = createEventChain([
			{ type: 'GOVERNANCE_LOADED', data: { test: true } },
		], TS);

		const proof = await generateProof({
			events,
			verifier,
			governancePolicyHash: hashGovernancePack({ name: 'test', version: '1.0.0', rules: [{ id: 'r1' }] }),
			systemStateHash: hashSystemState({}),
			fidelityScore: { overall: 1.0, dimensions: {}, threshold: 0.7, passed: true },
			evaluationResult: 'PASS',
			timestamp: TS,
		});

		const result = await verify.check(proof, attacker.publicKey);
		expect(result.valid).toBe(false);
	});

	it('rejects a proof with tampered evidence chain', async () => {
		const verifier = await createVerifier();
		const events = createEventChain([
			{ type: 'GOVERNANCE_LOADED', data: { pack: 'test' } },
			{ type: 'PROMPT_RECEIVED', data: { prompt: 'real data' } },
		], TS);

		const proof = await generateProof({
			events,
			verifier,
			governancePolicyHash: hashGovernancePack({ name: 'test', version: '1.0.0', rules: [{ id: 'r1' }] }),
			systemStateHash: hashSystemState({}),
			fidelityScore: { overall: 1.0, dimensions: {}, threshold: 0.7, passed: true },
			evaluationResult: 'PASS',
			timestamp: TS,
		});

		// Tamper: replace an event hash
		const tampered = { ...proof, evidence_chain: [...proof.evidence_chain] };
		tampered.evidence_chain[0] = { algorithm: 'sha3-256' as const, value: 'ff'.repeat(32) };

		const result = await verify.check(tampered, verifier.publicKey);
		expect(result.valid).toBe(false);
	});

	it('verify.check requires ONLY proof + public key — no other state', async () => {
		// This test proves the core value proposition:
		// Anyone can verify a proof with just the proof object and a public key.
		const verifier = await createVerifier();
		const events = createEventChain([
			{ type: 'GOVERNANCE_LOADED', data: { test: true } },
		], TS);

		const proof = await generateProof({
			events,
			verifier,
			governancePolicyHash: hashGovernancePack({ name: 'test', version: '1.0.0', rules: [{ id: 'r1' }] }),
			systemStateHash: hashSystemState({}),
			fidelityScore: { overall: 1.0, dimensions: {}, threshold: 0.7, passed: true },
			evaluationResult: 'PASS',
			timestamp: TS,
		});

		// Simulate sending proof + public key to a third party
		// They have NO access to the verifier, events, or any other state
		const publicKeyOnly = verifier.publicKey;
		const proofOnly = JSON.parse(JSON.stringify(proof, (_k, v) =>
			v instanceof Uint8Array ? { __u8: Array.from(v) } : v,
		), (_k, v) =>
			v && typeof v === 'object' && v.__u8 ? new Uint8Array(v.__u8) : v,
		) as typeof proof;

		// Independent verification succeeds
		const result = await verify.check(proofOnly, publicKeyOnly);
		expect(result.valid).toBe(true);
	});
});
