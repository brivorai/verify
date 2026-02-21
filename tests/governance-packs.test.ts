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
	it('lists all 24 pack entries', () => {
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
		expect(packs).toContain('texas-traiga');
		expect(packs).toContain('iso-42001');
		expect(packs).toContain('nyc-ll144');
		expect(packs).toContain('south-korea-ai-basic-act');
		expect(packs).toContain('singapore-ai-governance');
		expect(packs).toContain('nydfs-ai');
		expect(packs).toContain('sec-ai');
		expect(packs).toContain('fda-ai-ml');
		expect(packs).toContain('china-ai-labeling');
		expect(packs).toContain('china-cybersecurity-ai');
		expect(packs).toContain('japan-ai-governance');
		expect(packs).toContain('iso-27001-ai');
		expect(packs).toContain('oecd-ai-principles');
		expect(packs).toContain('california-ai-transparency');
		expect(packs).toContain('canada-aida');
		expect(packs.length).toBeGreaterThanOrEqual(24);
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

describe('Texas TRAIGA', () => {
	validatePack('texas-traiga', 12, 0.75, [
		'prohibited_practices',
		'nondiscrimination',
		'transparency',
		'compliance_readiness',
	]);
});

describe('ISO 42001', () => {
	validatePack('iso-42001', 14, 0.8, [
		'governance_framework',
		'risk_management',
		'transparency_fairness',
		'operational_controls',
	]);
});

describe('NYC Local Law 144', () => {
	validatePack('nyc-ll144', 12, 0.85, [
		'bias_audit_compliance',
		'notice_requirements',
		'operational_monitoring',
		'data_protection',
	]);
});

describe('South Korea AI Basic Act', () => {
	validatePack('south-korea-ai-basic-act', 11, 0.8, [
		'risk_classification',
		'transparency',
		'safety_fairness',
		'operational_compliance',
	]);
});

describe('Singapore AI Governance', () => {
	validatePack('singapore-ai-governance', 12, 0.75, [
		'governance_structure',
		'transparency_explainability',
		'safety_fairness',
		'data_protection',
	]);
});

describe('NYDFS AI', () => {
	validatePack('nydfs-ai', 10, 0.85, [
		'fair_insurance',
		'governance_oversight',
		'transparency_privacy',
		'security_compliance',
	]);
});

describe('SEC AI', () => {
	validatePack('sec-ai', 10, 0.85, [
		'investor_protection',
		'transparency_disclosure',
		'governance_controls',
		'recordkeeping',
	]);
});

describe('FDA AI/ML', () => {
	validatePack('fda-ai-ml', 12, 0.9, [
		'premarket_compliance',
		'data_quality',
		'postmarket_monitoring',
		'safety_security',
	]);
});

describe('China AI Labeling', () => {
	validatePack('china-ai-labeling', 10, 0.85, [
		'labeling_compliance',
		'provider_obligations',
		'content_safety',
		'recordkeeping',
	]);
});

describe('China Cybersecurity AI', () => {
	validatePack('china-cybersecurity-ai', 10, 0.9, [
		'regulatory_compliance',
		'content_safety',
		'data_security',
		'operational_compliance',
	]);
});

describe('Japan AI Governance', () => {
	validatePack('japan-ai-governance', 11, 0.7, [
		'human_centric_values',
		'transparency_accountability',
		'safety',
		'data_protection',
	]);
});

describe('ISO 27001 AI', () => {
	validatePack('iso-27001-ai', 11, 0.8, [
		'access_security',
		'risk_management',
		'data_protection',
		'operational_security',
	]);
});

describe('OECD AI Principles', () => {
	validatePack('oecd-ai-principles', 11, 0.7, [
		'values_fairness',
		'transparency',
		'safety_robustness',
		'accountability_governance',
	]);
});

describe('California AI Transparency', () => {
	validatePack('california-ai-transparency', 10, 0.8, [
		'training_data_transparency',
		'content_provenance',
		'user_transparency',
		'consumer_protection',
	]);
});

describe('Canada AIDA', () => {
	validatePack('canada-aida', 11, 0.75, [
		'risk_management',
		'transparency',
		'safety_fairness',
		'compliance_operations',
	]);
});
