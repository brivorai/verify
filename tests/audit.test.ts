import { describe, it, expect, afterEach } from 'vitest';
import { createAuditStore } from '../src/audit.js';
import { generateProof, hashProof } from '../src/proof.js';
import { createEventChain, hashGovernancePack, hashSystemState } from '../src/events.js';
import { createVerifier } from '../src/verifier.js';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { BrivoraProof } from '../src/types.js';

const TS = '2026-01-01T00:00:00.000Z';

async function makeTestProof(idx = 0): Promise<BrivoraProof> {
	const verifier = await createVerifier();
	const events = createEventChain(
		[{ type: 'GOVERNANCE_LOADED', data: { idx } }],
		`${TS.slice(0, -5)}${String(idx).padStart(2, '0')}.000Z`,
	);
	return generateProof({
		events,
		verifier,
		governancePolicyHash: hashGovernancePack({ name: 'test', version: '1.0.0', rules: [{ id: 'r1' }] }),
		systemStateHash: hashSystemState({ idx }),
		fidelityScore: { overall: 0.9, dimensions: {}, threshold: 0.7, passed: true },
		evaluationResult: 'PASS',
		timestamp: `${TS.slice(0, -5)}${String(idx).padStart(2, '0')}.000Z`,
	});
}

describe('audit store', () => {
	describe('memory store', () => {
		it('saves and loads a proof', async () => {
			const store = createAuditStore({ type: 'memory' });
			const proof = await makeTestProof();
			await store.save(proof);

			const hash = hashProof(proof);
			const loaded = await store.load(hash);
			expect(loaded).toBeDefined();
			expect(loaded!.timestamp).toBe(proof.timestamp);
		});

		it('returns null for unknown hash', async () => {
			const store = createAuditStore({ type: 'memory' });
			const result = await store.load({ algorithm: 'sha3-256', value: '0'.repeat(64) });
			expect(result).toBeNull();
		});

		it('lists all proofs', async () => {
			const store = createAuditStore({ type: 'memory' });
			const p1 = await makeTestProof(0);
			const p2 = await makeTestProof(1);
			await store.save(p1);
			await store.save(p2);

			const list = await store.list();
			expect(list).toHaveLength(2);
		});

		it('supports limit and offset', async () => {
			const store = createAuditStore({ type: 'memory' });
			for (let i = 0; i < 5; i++) {
				await store.save(await makeTestProof(i));
			}

			const page = await store.list({ limit: 2, offset: 1 });
			expect(page).toHaveLength(2);
		});

		it('chains from a starting proof', async () => {
			const store = createAuditStore({ type: 'memory' });
			const proofs = [];
			for (let i = 0; i < 3; i++) {
				const p = await makeTestProof(i);
				await store.save(p);
				proofs.push(p);
			}

			const hash = hashProof(proofs[1]!);
			const chain = await store.chain({ from: hash });
			expect(chain).toHaveLength(2); // from index 1 to end
		});
	});

	describe('file store', () => {
		const testDir = join(tmpdir(), `brivora-verify-test-${Date.now()}`);

		afterEach(async () => {
			try {
				await rm(testDir, { recursive: true, force: true });
			} catch {
				// ignore
			}
		});

		it('saves and loads a proof', async () => {
			const store = createAuditStore({ type: 'file', path: testDir });
			const proof = await makeTestProof();
			await store.save(proof);

			const hash = hashProof(proof);
			const loaded = await store.load(hash);
			expect(loaded).toBeDefined();
			expect(loaded!.version).toBe('1.0');
			expect(loaded!.timestamp).toBe(proof.timestamp);
		});

		it('returns null for unknown hash', async () => {
			const store = createAuditStore({ type: 'file', path: testDir });
			// Ensure dir exists
			await store.list();
			const result = await store.load({ algorithm: 'sha3-256', value: '0'.repeat(64) });
			expect(result).toBeNull();
		});

		it('lists all saved proofs', async () => {
			const store = createAuditStore({ type: 'file', path: testDir });
			await store.save(await makeTestProof(0));
			await store.save(await makeTestProof(1));

			const list = await store.list();
			expect(list).toHaveLength(2);
		});
	});

	describe('custom store', () => {
		it('uses provided adapter', async () => {
			const saved: BrivoraProof[] = [];
			const adapter = {
				save: async (proof: BrivoraProof) => { saved.push(proof); },
				load: async () => null,
				list: async () => saved,
				chain: async () => saved,
			};

			const store = createAuditStore({ type: 'custom', adapter });
			const proof = await makeTestProof();
			await store.save(proof);
			expect(saved).toHaveLength(1);
		});
	});

	describe('factory errors', () => {
		it('throws for file store without path', () => {
			expect(() => createAuditStore({ type: 'file' })).toThrow('path');
		});

		it('throws for custom store without adapter', () => {
			expect(() => createAuditStore({ type: 'custom' })).toThrow('adapter');
		});
	});
});
