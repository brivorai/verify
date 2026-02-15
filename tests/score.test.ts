import { describe, it, expect } from 'vitest';
import { computeFidelityScore } from '../src/score.js';
import type { RuleResult, ScoringConfig } from '../src/types.js';

function makeConfig(): ScoringConfig {
	return {
		dimensions: [
			{ name: 'transparency', rules: ['rule-1', 'rule-2'] },
			{ name: 'safety', rules: ['rule-3'] },
		],
		threshold: 0.7,
		weights: { transparency: 0.6, safety: 0.4 },
	};
}

function makeResult(
	id: string,
	result: 'PASS' | 'FAIL' | 'SKIP',
	severity: 'critical' | 'high' | 'medium' | 'low' = 'high',
): RuleResult {
	return {
		rule_id: id,
		rule_name: `Rule ${id}`,
		severity,
		result,
	};
}

describe('fidelity scoring', () => {
	it('computes perfect score when all rules pass', () => {
		const results = [
			makeResult('rule-1', 'PASS'),
			makeResult('rule-2', 'PASS'),
			makeResult('rule-3', 'PASS'),
		];
		const score = computeFidelityScore(results, makeConfig());
		expect(score.overall).toBe(1.0);
		expect(score.passed).toBe(true);
		expect(score.dimensions.transparency).toBe(1.0);
		expect(score.dimensions.safety).toBe(1.0);
	});

	it('computes zero score when all rules fail', () => {
		const results = [
			makeResult('rule-1', 'FAIL'),
			makeResult('rule-2', 'FAIL'),
			makeResult('rule-3', 'FAIL'),
		];
		const score = computeFidelityScore(results, makeConfig());
		expect(score.overall).toBe(0);
		expect(score.passed).toBe(false);
	});

	it('computes weighted partial score correctly', () => {
		const results = [
			makeResult('rule-1', 'PASS'),
			makeResult('rule-2', 'FAIL'),
			makeResult('rule-3', 'PASS'),
		];
		const score = computeFidelityScore(results, makeConfig());
		// transparency = 1/2 = 0.5, safety = 1/1 = 1.0
		// overall = 0.5 * 0.6 + 1.0 * 0.4 = 0.3 + 0.4 = 0.7
		expect(score.overall).toBeCloseTo(0.7);
		expect(score.passed).toBe(true); // 0.7 >= 0.7
		expect(score.dimensions.transparency).toBe(0.5);
		expect(score.dimensions.safety).toBe(1.0);
	});

	it('skipped rules are excluded from dimension scoring', () => {
		const results = [
			makeResult('rule-1', 'PASS'),
			makeResult('rule-2', 'SKIP'),
			makeResult('rule-3', 'PASS'),
		];
		const score = computeFidelityScore(results, makeConfig());
		// transparency: rule-1 PASS, rule-2 SKIP → 1/1 = 1.0
		expect(score.dimensions.transparency).toBe(1.0);
		expect(score.overall).toBe(1.0);
	});

	it('handles empty results', () => {
		const score = computeFidelityScore([], makeConfig());
		// No applicable rules → all dimensions get 1.0
		expect(score.overall).toBe(1.0);
		expect(score.passed).toBe(true);
	});

	it('respects threshold setting', () => {
		const config = { ...makeConfig(), threshold: 0.9 };
		const results = [
			makeResult('rule-1', 'PASS'),
			makeResult('rule-2', 'FAIL'),
			makeResult('rule-3', 'PASS'),
		];
		const score = computeFidelityScore(results, config);
		expect(score.overall).toBeCloseTo(0.7);
		expect(score.passed).toBe(false); // 0.7 < 0.9
		expect(score.threshold).toBe(0.9);
	});
});
