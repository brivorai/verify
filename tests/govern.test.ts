import { describe, it, expect } from 'vitest';
import { verify } from '../src/verify.js';
import { createVerifier } from '../src/verifier.js';

describe('verify.govern — core governance flow', () => {
	it('governs a simple AI call and returns a valid result', async () => {
		const verifier = await createVerifier();
		const mockResponse = { text: 'AI response here', model: 'test-model' };

		const result = await verify.govern(
			async () => mockResponse,
			{
				governance: 'minimal',
				verifier,
				metadata: {
					prompt: 'Test prompt',
					model: 'test-model',
				},
			},
		);

		expect(result.output).toEqual(mockResponse);
		expect(result.proof).toBeDefined();
		expect(result.proof.version).toBe('1.0');
		expect(result.proof.merkle_root.algorithm).toBe('sha3-256');
		expect(result.proof.signature.algorithm).toBe('hybrid-pqc-v1');
		expect(result.report).toBeDefined();
		expect(result.score).toBeDefined();
		expect(result.timing.total).toBeGreaterThan(0);
		expect(result.timing.aiCall).toBeGreaterThan(0);
	});

	it('generates a proof that can be independently verified', async () => {
		const verifier = await createVerifier();

		const result = await verify.govern(
			async () => 'test output',
			{
				governance: 'minimal',
				verifier,
				metadata: { prompt: 'hello', model: 'test' },
			},
		);

		// Independently verify the proof
		const checkResult = await verify.check(result.proof, verifier.publicKey);
		expect(checkResult.valid).toBe(true);
	});

	it('returns events when audit is enabled (default)', async () => {
		const verifier = await createVerifier();

		const result = await verify.govern(
			async () => 'response',
			{
				governance: 'minimal',
				verifier,
				metadata: { prompt: 'test', model: 'test' },
			},
		);

		expect(result.events.length).toBeGreaterThan(0);
		expect(result.events[0]!.type).toBe('GOVERNANCE_LOADED');
	});

	it('returns empty events when audit is disabled', async () => {
		const verifier = await createVerifier();

		const result = await verify.govern(
			async () => 'response',
			{
				governance: 'minimal',
				verifier,
				audit: false,
				metadata: { prompt: 'test', model: 'test' },
			},
		);

		expect(result.events).toHaveLength(0);
	});

	it('calls onPreEval and onPostEval hooks', async () => {
		const verifier = await createVerifier();
		let preEvalCalled = false;
		let postEvalCalled = false;

		await verify.govern(
			async () => 'response',
			{
				governance: 'minimal',
				verifier,
				metadata: { prompt: 'test', model: 'test' },
				onPreEval: (ctx) => {
					preEvalCalled = true;
					expect(ctx.ruleResults.length).toBeGreaterThan(0);
				},
				onPostEval: (ctx) => {
					postEvalCalled = true;
					expect(ctx.fidelity_score).toBeDefined();
				},
			},
		);

		expect(preEvalCalled).toBe(true);
		expect(postEvalCalled).toBe(true);
	});

	it('includes metadata in the proof', async () => {
		const verifier = await createVerifier();

		const result = await verify.govern(
			async () => 'response',
			{
				governance: 'minimal',
				verifier,
				metadata: {
					prompt: 'test',
					model: 'test',
					custom_field: 'custom_value',
				},
			},
		);

		expect(result.proof.metadata).toBeDefined();
		expect(result.proof.metadata!.custom_field).toBe('custom_value');
	});

	it('creates an ephemeral verifier if none provided', async () => {
		const result = await verify.govern(
			async () => 'response',
			{
				governance: 'minimal',
				metadata: { prompt: 'test', model: 'test' },
			},
		);

		expect(result.proof.verifier).toBeDefined();
		expect(result.proof.signature).toBeDefined();
	});

	it('handles AI call failures gracefully', async () => {
		const verifier = await createVerifier();

		await expect(
			verify.govern(
				async () => { throw new Error('API error'); },
				{
					governance: 'minimal',
					verifier,
					metadata: { prompt: 'test', model: 'test' },
				},
			),
		).rejects.toThrow('API error');
	});

	it('supports proof chaining', async () => {
		const verifier = await createVerifier();
		const chain = verify.createChain(verifier);

		const r1 = await verify.govern(
			async () => 'first',
			{
				governance: 'minimal',
				verifier,
				chain,
				metadata: { prompt: 'first', model: 'test' },
			},
		);

		const r2 = await verify.govern(
			async () => 'second',
			{
				governance: 'minimal',
				verifier,
				chain,
				metadata: { prompt: 'second', model: 'test' },
			},
		);

		expect(r1.proof.previous_proof).toBeUndefined();
		expect(r2.proof.previous_proof).toBeDefined();
		expect(r2.proof.previous_proof!.algorithm).toBe('sha3-256');
	});
});
