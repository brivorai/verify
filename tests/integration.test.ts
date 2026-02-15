import { describe, it, expect } from 'vitest';
import { verify } from '../src/verify.js';
import { createVerifier } from '../src/verifier.js';

describe('integration — full govern() → check() round-trip', () => {
	it('complete EU AI Act governance flow', async () => {
		const verifier = await createVerifier();

		// Simulate an AI call with full metadata
		const result = await verify.govern(
			async () => ({
				id: 'msg_123',
				content: 'Based on the loan application analysis...',
				model: 'claude-opus-4-6',
				usage: { input_tokens: 150, output_tokens: 200 },
			}),
			{
				governance: 'eu-ai-act-v1',
				verifier,
				metadata: {
					prompt: 'Analyze this loan application for risk factors',
					model: 'claude-opus-4-6',
					parameters: { temperature: 0.3 },
					subject: 'loan-analysis-system',
				},
			},
		);

		// Result shape
		expect(result.output.content).toContain('loan application');
		expect(result.proof.version).toBe('1.0');
		expect(result.proof.subject).toBe('loan-analysis-system');
		expect(result.valid).toBeDefined();
		expect(result.score.overall).toBeGreaterThanOrEqual(0);
		expect(result.score.overall).toBeLessThanOrEqual(1);
		expect(result.report.governance_pack).toBe('eu-ai-act-v1');
		expect(result.report.rule_results.length).toBeGreaterThan(0);
		expect(result.events.length).toBeGreaterThan(0);

		// Timing
		expect(result.timing.total).toBeGreaterThan(0);
		expect(result.timing.aiCall).toBeGreaterThanOrEqual(0);
		expect(result.timing.governance).toBeGreaterThanOrEqual(0);

		// Independent verification
		const checkResult = await verify.check(result.proof, verifier.publicKey);
		expect(checkResult.valid).toBe(true);
		expect(checkResult.evaluation_result).toBeDefined();
		expect(checkResult.governance_policy.algorithm).toBe('sha3-256');
	});

	it('full chain of 3 governed calls with verification', async () => {
		const verifier = await createVerifier();
		const chain = verify.createChain(verifier);
		const proofs = [];

		for (let i = 0; i < 3; i++) {
			const result = await verify.govern(
				async () => ({ response: `Response ${i}` }),
				{
					governance: 'minimal',
					verifier,
					chain,
					metadata: {
						prompt: `Query ${i}`,
						model: 'test-model',
					},
				},
			);

			proofs.push(result.proof);

			// Each proof is individually verifiable
			const check = await verify.check(result.proof, verifier.publicKey);
			expect(check.valid).toBe(true);
		}

		// Verify the entire chain
		const chainResult = await verify.checkChain(proofs, verifier.publicKey);
		expect(chainResult.valid).toBe(true);
		expect(chainResult.chain_integrity).toBe(true);
		expect(chainResult.length).toBe(3);
	});

	it('proof survives JSON serialization round-trip', async () => {
		const verifier = await createVerifier();

		const result = await verify.govern(
			async () => 'test response',
			{
				governance: 'minimal',
				verifier,
				metadata: { prompt: 'test', model: 'test' },
			},
		);

		// Serialize to JSON (converting Uint8Arrays)
		const json = JSON.stringify(result.proof, (_k, v) =>
			v instanceof Uint8Array ? { __u8: Array.from(v) } : v,
		);

		// Deserialize
		const restored = JSON.parse(json, (_k, v) =>
			v && typeof v === 'object' && v.__u8 ? new Uint8Array(v.__u8) : v,
		);

		// Verify the restored proof
		const check = await verify.check(restored, verifier.publicKey);
		expect(check.valid).toBe(true);
	});

	it('proof + audit store round-trip', async () => {
		const verifier = await createVerifier();
		const store = verify.createAuditStore({ type: 'memory' });

		const result = await verify.govern(
			async () => 'stored response',
			{
				governance: 'minimal',
				verifier,
				metadata: { prompt: 'test', model: 'test' },
			},
		);

		// Store the proof
		await store.save(result.proof);

		// Retrieve and verify
		const proofHash = verify.hashProof(result.proof);
		const loaded = await store.load(proofHash);
		expect(loaded).toBeDefined();

		const check = await verify.check(loaded!, verifier.publicKey);
		expect(check.valid).toBe(true);
	});

	it('governance overhead is reasonable', async () => {
		const verifier = await createVerifier();

		const result = await verify.govern(
			async () => {
				// Simulate a fast AI call (1ms)
				await new Promise((r) => setTimeout(r, 1));
				return 'response';
			},
			{
				governance: 'minimal',
				verifier,
				metadata: { prompt: 'test', model: 'test' },
			},
		);

		// Governance + proof overhead should be reasonable
		// (PQC signing is ~10-30ms, so allow for that)
		expect(result.timing.governance).toBeLessThan(500);
		expect(result.timing.proof).toBeLessThan(500);
	});

	it('TAMPER DETECTION end-to-end: modified event breaks verification', async () => {
		const verifier = await createVerifier();

		const result = await verify.govern(
			async () => 'real response',
			{
				governance: 'minimal',
				verifier,
				metadata: { prompt: 'real prompt', model: 'real-model' },
			},
		);

		// Original verifies
		const original = await verify.check(result.proof, verifier.publicKey);
		expect(original.valid).toBe(true);

		// Tamper with evidence chain
		const tampered = {
			...result.proof,
			evidence_chain: result.proof.evidence_chain.map((h, i) =>
				i === 0 ? { ...h, value: '00'.repeat(32) } : h,
			),
		};

		// Tampered proof MUST fail
		const check = await verify.check(tampered, verifier.publicKey);
		expect(check.valid).toBe(false);
	});

	it('verify.listPacks returns available packs', () => {
		const packs = verify.listPacks();
		expect(packs).toContain('eu-ai-act-v1');
		expect(packs).toContain('minimal');
	});

	it('verify.loadPack returns a valid pack', () => {
		const pack = verify.loadPack('eu-ai-act-v1');
		expect(pack.name).toBe('eu-ai-act-v1');
		expect(pack.rules.length).toBe(7);
	});
});
