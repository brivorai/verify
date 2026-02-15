import { describe, it, expect } from 'vitest';
import { createEvent, createEventChain, hashGovernancePack, hashSystemState } from '../src/events.js';

describe('events', () => {
	describe('createEvent', () => {
		it('creates an event with a computed hash', () => {
			const event = createEvent('GOVERNANCE_LOADED', {
				pack_name: 'eu-ai-act-v1',
				rule_count: 7,
			});

			expect(event.type).toBe('GOVERNANCE_LOADED');
			expect(event.timestamp).toBeDefined();
			expect(event.hash.algorithm).toBe('sha3-256');
			expect(event.hash.value).toMatch(/^[a-f0-9]{64}$/);
			expect(event.data.pack_name).toBe('eu-ai-act-v1');
			expect(event.parent_hash).toBeUndefined();
		});

		it('includes parent_hash when provided', () => {
			const parent = createEvent('GOVERNANCE_LOADED', { test: true });
			const child = createEvent('PROMPT_RECEIVED', { prompt: 'hello' }, parent.hash);

			expect(child.parent_hash).toEqual(parent.hash);
		});

		it('uses provided timestamp for determinism', () => {
			const ts = '2026-01-01T00:00:00.000Z';
			const event = createEvent('GOVERNANCE_LOADED', { test: true }, undefined, ts);
			expect(event.timestamp).toBe(ts);
		});

		it('produces deterministic hashes for same inputs', () => {
			const ts = '2026-01-01T00:00:00.000Z';
			const e1 = createEvent('GOVERNANCE_LOADED', { a: 1, b: 2 }, undefined, ts);
			const e2 = createEvent('GOVERNANCE_LOADED', { b: 2, a: 1 }, undefined, ts);

			// Keys are sorted, so order shouldn't matter
			expect(e1.hash.value).toBe(e2.hash.value);
		});

		it('produces different hashes for different inputs', () => {
			const ts = '2026-01-01T00:00:00.000Z';
			const e1 = createEvent('GOVERNANCE_LOADED', { a: 1 }, undefined, ts);
			const e2 = createEvent('GOVERNANCE_LOADED', { a: 2 }, undefined, ts);

			expect(e1.hash.value).not.toBe(e2.hash.value);
		});
	});

	describe('createEventChain', () => {
		it('creates a chain of events linked by parent_hash', () => {
			const events = createEventChain([
				{ type: 'GOVERNANCE_LOADED', data: { pack: 'test' } },
				{ type: 'PROMPT_RECEIVED', data: { prompt: 'hello' } },
				{ type: 'RESPONSE_RECEIVED', data: { response: 'world' } },
			]);

			expect(events).toHaveLength(3);
			expect(events[0]!.parent_hash).toBeUndefined();
			expect(events[1]!.parent_hash).toEqual(events[0]!.hash);
			expect(events[2]!.parent_hash).toEqual(events[1]!.hash);
		});

		it('returns empty array for empty input', () => {
			const events = createEventChain([]);
			expect(events).toHaveLength(0);
		});
	});

	describe('hashGovernancePack', () => {
		it('produces a SHA-3-256 hash of pack metadata', () => {
			const hash = hashGovernancePack({
				name: 'eu-ai-act-v1',
				version: '1.0.0',
				rules: [{ id: 'rule-1' }, { id: 'rule-2' }],
			});

			expect(hash.algorithm).toBe('sha3-256');
			expect(hash.value).toMatch(/^[a-f0-9]{64}$/);
		});

		it('produces deterministic hashes', () => {
			const h1 = hashGovernancePack({
				name: 'test',
				version: '1.0.0',
				rules: [{ id: 'a' }, { id: 'b' }],
			});
			const h2 = hashGovernancePack({
				name: 'test',
				version: '1.0.0',
				rules: [{ id: 'b' }, { id: 'a' }],
			});

			// Rule IDs are sorted, so order doesn't matter
			expect(h1.value).toBe(h2.value);
		});
	});

	describe('hashSystemState', () => {
		it('produces a SHA-3-256 hash', () => {
			const hash = hashSystemState({ key: 'value' });
			expect(hash.algorithm).toBe('sha3-256');
			expect(hash.value).toMatch(/^[a-f0-9]{64}$/);
		});

		it('is deterministic for same input', () => {
			const h1 = hashSystemState({ a: 1, b: 2 });
			const h2 = hashSystemState({ b: 2, a: 1 });
			expect(h1.value).toBe(h2.value);
		});
	});
});
