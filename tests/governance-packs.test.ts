import { describe, it, expect } from 'vitest';
import { loadPack, listPacks } from '../src/pack.js';

/**
 * Helper: validates a pack has valid structure, weights sum to 1.0,
 * and all scoring dimensions reference valid rule IDs.
 */
function validatePack(
	name: string,
	expectedRuleCount: number,
	expectedThreshold: number,
	expectedDimensions: string[],
) {
	describe(name, () => {
		it('loads correctly by name', () => {
			const pack = loadPack(name);
			expect(pack.name).toBe(name);
		});

		it(`has ${expectedRuleCount} rules`, () => {
			const pack = loadPack(name);
			expect(pack.rules).toHaveLength(expectedRuleCount);
		});

		it('has no duplicate rule IDs', () => {
			const pack = loadPack(name);
			const ids = pack.rules.map((r) => r.id);
			expect(new Set(ids).size).toBe(ids.length);
		});

		it(`has threshold of ${expectedThreshold}`, () => {
			const pack = loadPack(name);
			expect(pack.scoring.threshold).toBe(expectedThreshold);
		});

		it('has correct scoring dimensions', () => {
			const pack = loadPack(name);
			const dimNames = pack.scoring.dimensions.map((d) => d.name);
			for (const dim of expectedDimensions) {
				expect(dimNames).toContain(dim);
			}
			expect(dimNames).toHaveLength(expectedDimensions.length);
		});

		it('has weights that sum to 1.0', () => {
			const pack = loadPack(name);
			const sum = Object.values(pack.scoring.weights).reduce((a, b) => a + b, 0);
			expect(sum).toBeCloseTo(1.0);
		});

		it('has matching weight keys and dimension names', () => {
			const pack = loadPack(name);
			const dimNames = pack.scoring.dimensions.map((d) => d.name).sort();
			const weightKeys = Object.keys(pack.scoring.weights).sort();
			expect(weightKeys).toEqual(dimNames);
		});

		it('all scoring dimensions reference valid rule IDs', () => {
			const pack = loadPack(name);
			const ruleIds = new Set(pack.rules.map((r) => r.id));
			for (const dim of pack.scoring.dimensions) {
				for (const ruleId of dim.rules) {
					expect(ruleIds.has(ruleId)).toBe(true);
				}
			}
		});

		it('all rules have valid phase and severity', () => {
			const pack = loadPack(name);
			for (const rule of pack.rules) {
				expect(['pre', 'post', 'both']).toContain(rule.phase);
				expect(['critical', 'high', 'medium', 'low']).toContain(rule.severity);
			}
		});

		it('has metadata', () => {
			const pack = loadPack(name);
			expect(pack.metadata).toBeDefined();
			expect(typeof pack.metadata).toBe('object');
		});
	});
}

describe('governance packs registry', () => {
	it('lists all 9 pack entries', () => {
		const packs = listPacks();
		expect(packs).toContain('eu-ai-act-v1');
		expect(packs).toContain('eu-ai-act-v2');
		expect(packs).toContain('eu-ai-act');
		expect(packs).toContain('minimal');
		expect(packs).toContain('soc2-ai');
		expect(packs).toContain('ccpa-admt');
		expect(packs).toContain('hipaa-ai');
		expect(packs).toContain('nist-ai-rmf');
		expect(packs).toContain('colorado-ai-act');
		expect(packs.length).toBeGreaterThanOrEqual(9);
	});

	it('eu-ai-act alias points to v2', () => {
		const alias = loadPack('eu-ai-act');
		const v2 = loadPack('eu-ai-act-v2');
		expect(alias).toBe(v2);
	});
});

describe('EU AI Act v2', () => {
	validatePack('eu-ai-act-v2', 22, 0.8, [
		'risk_management',
		'data_governance',
		'documentation',
		'traceability',
		'transparency',
		'human_oversight',
		'robustness',
		'cybersecurity',
		'safety',
	]);
});

describe('SOC 2 AI Controls', () => {
	validatePack('soc2-ai', 12, 0.8, [
		'access_control',
		'processing_integrity',
		'data_protection',
		'operational_monitoring',
	]);
});

describe('CCPA ADMT', () => {
	validatePack('ccpa-admt', 12, 0.85, [
		'notice_transparency',
		'consumer_rights',
		'risk_governance',
		'data_protection',
	]);
});

describe('HIPAA AI', () => {
	validatePack('hipaa-ai', 14, 0.9, [
		'phi_protection',
		'access_and_authorization',
		'security_controls',
		'audit_and_accountability',
		'nondiscrimination',
		'transparency_and_provenance',
	]);

	it('has 5 critical rules that must pass', () => {
		const pack = loadPack('hipaa-ai');
		const criticalRules = pack.rules.filter((r) => r.severity === 'critical');
		expect(criticalRules.length).toBeGreaterThanOrEqual(5);

		const criticalIds = criticalRules.map((r) => r.id);
		expect(criticalIds).toContain('hipaa-ai-001');
		expect(criticalIds).toContain('hipaa-ai-002');
		expect(criticalIds).toContain('hipaa-ai-004');
		expect(criticalIds).toContain('hipaa-ai-005');
		expect(criticalIds).toContain('hipaa-ai-010');
	});

	it('uses pii_detection with action block (not flag)', () => {
		const pack = loadPack('hipaa-ai');
		const phiInput = pack.rules.find((r) => r.id === 'hipaa-ai-001');
		const phiOutput = pack.rules.find((r) => r.id === 'hipaa-ai-002');
		expect(phiInput?.evaluate).toMatchObject({ type: 'pii_detection', action: 'block' });
		expect(phiOutput?.evaluate).toMatchObject({ type: 'pii_detection', action: 'block' });
	});
});

describe('NIST AI RMF', () => {
	validatePack('nist-ai-rmf', 12, 0.75, [
		'governance',
		'risk_mapping',
		'trustworthiness_measurement',
		'risk_management',
	]);
});

describe('Colorado AI Act', () => {
	validatePack('colorado-ai-act', 12, 0.75, [
		'algorithmic_fairness',
		'transparency',
		'documentation',
		'governance',
	]);
});
