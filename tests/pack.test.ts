import { describe, it, expect } from 'vitest';
import { loadPack, createPack, listPacks } from '../src/pack.js';

describe('governance packs', () => {
	describe('loadPack', () => {
		it('loads the eu-ai-act-v1 pack', () => {
			const pack = loadPack('eu-ai-act-v1');
			expect(pack.name).toBe('eu-ai-act-v1');
			expect(pack.version).toBe('1.0.0');
			expect(pack.rules).toHaveLength(7);
		});

		it('loads the minimal pack', () => {
			const pack = loadPack('minimal');
			expect(pack.name).toBe('minimal');
			expect(pack.rules).toHaveLength(2);
		});

		it('throws for unknown pack name', () => {
			expect(() => loadPack('nonexistent')).toThrow('Unknown governance pack');
		});
	});

	describe('listPacks', () => {
		it('lists all built-in packs', () => {
			const packs = listPacks();
			expect(packs).toContain('eu-ai-act-v1');
			expect(packs).toContain('minimal');
			expect(packs.length).toBeGreaterThanOrEqual(24);
		});
	});

	describe('createPack', () => {
		it('creates a valid pack from definition', () => {
			const pack = createPack({
				name: 'custom-pack',
				version: '1.0.0',
				description: 'Custom pack',
				rules: [
					{
						id: 'custom-rule',
						name: 'Custom Rule',
						description: 'A custom rule',
						phase: 'pre',
						severity: 'high',
						evaluate: { type: 'required', fields: ['prompt'] },
					},
				],
				scoring: {
					dimensions: [{ name: 'custom', rules: ['custom-rule'] }],
					threshold: 0.5,
					weights: { custom: 1.0 },
				},
			});

			expect(pack.name).toBe('custom-pack');
			expect(pack.rules).toHaveLength(1);
			expect(pack.metadata).toEqual({});
		});

		it('throws for missing name', () => {
			expect(() =>
				createPack({
					name: '',
					version: '1.0.0',
					description: '',
					rules: [{ id: 'r', name: 'R', description: '', phase: 'pre', severity: 'low', evaluate: { type: 'required', fields: ['x'] } }],
					scoring: { dimensions: [], threshold: 0.5, weights: {} },
				}),
			).toThrow('name');
		});

		it('throws for empty rules', () => {
			expect(() =>
				createPack({
					name: 'test',
					version: '1.0.0',
					description: '',
					rules: [],
					scoring: { dimensions: [], threshold: 0.5, weights: {} },
				}),
			).toThrow('at least one rule');
		});

		it('throws for duplicate rule IDs', () => {
			expect(() =>
				createPack({
					name: 'test',
					version: '1.0.0',
					description: '',
					rules: [
						{ id: 'dup', name: 'R1', description: '', phase: 'pre', severity: 'low', evaluate: { type: 'required', fields: ['x'] } },
						{ id: 'dup', name: 'R2', description: '', phase: 'pre', severity: 'low', evaluate: { type: 'required', fields: ['y'] } },
					],
					scoring: { dimensions: [], threshold: 0.5, weights: {} },
				}),
			).toThrow('Duplicate rule id');
		});

		it('throws for invalid threshold', () => {
			expect(() =>
				createPack({
					name: 'test',
					version: '1.0.0',
					description: '',
					rules: [{ id: 'r', name: 'R', description: '', phase: 'pre', severity: 'low', evaluate: { type: 'required', fields: ['x'] } }],
					scoring: { dimensions: [], threshold: 1.5, weights: {} },
				}),
			).toThrow('threshold');
		});

		it('throws when scoring dimension references unknown rule', () => {
			expect(() =>
				createPack({
					name: 'test',
					version: '1.0.0',
					description: '',
					rules: [{ id: 'r1', name: 'R', description: '', phase: 'pre', severity: 'low', evaluate: { type: 'required', fields: ['x'] } }],
					scoring: {
						dimensions: [{ name: 'dim', rules: ['nonexistent'] }],
						threshold: 0.5,
						weights: {},
					},
				}),
			).toThrow('unknown rule');
		});
	});

	describe('EU AI Act v1 pack validation', () => {
		it('has all 7 required rules', () => {
			const pack = loadPack('eu-ai-act-v1');
			const ruleIds = pack.rules.map((r) => r.id);
			expect(ruleIds).toContain('art-12-1-logging');
			expect(ruleIds).toContain('art-12-2-traceability');
			expect(ruleIds).toContain('art-12-3-monitoring');
			expect(ruleIds).toContain('art-14-human-oversight');
			expect(ruleIds).toContain('art-13-transparency');
			expect(ruleIds).toContain('content-safety');
			expect(ruleIds).toContain('pii-detection');
		});

		it('has correct scoring dimensions', () => {
			const pack = loadPack('eu-ai-act-v1');
			const dimNames = pack.scoring.dimensions.map((d) => d.name);
			expect(dimNames).toContain('transparency');
			expect(dimNames).toContain('traceability');
			expect(dimNames).toContain('safety');
			expect(dimNames).toContain('privacy');
		});

		it('has weights that sum to 1.0', () => {
			const pack = loadPack('eu-ai-act-v1');
			const sum = Object.values(pack.scoring.weights).reduce((a, b) => a + b, 0);
			expect(sum).toBeCloseTo(1.0);
		});

		it('has threshold of 0.7', () => {
			const pack = loadPack('eu-ai-act-v1');
			expect(pack.scoring.threshold).toBe(0.7);
		});
	});
});
