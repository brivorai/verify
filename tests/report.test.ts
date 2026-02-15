import { describe, it, expect } from 'vitest';
import { generateReport } from '../src/report.js';
import type { FidelityScore, GovernancePack, RuleResult, ContentHash } from '../src/types.js';

const mockPack: GovernancePack = {
	name: 'test-pack',
	version: '1.0.0',
	description: 'Test pack',
	rules: [],
	scoring: { dimensions: [], threshold: 0.7, weights: {} },
	metadata: {},
};

const mockScore: FidelityScore = {
	overall: 0.85,
	dimensions: {},
	threshold: 0.7,
	passed: true,
};

const mockHash: ContentHash = {
	algorithm: 'sha3-256',
	value: 'abc123'.padEnd(64, '0'),
};

describe('report generation', () => {
	it('generates a PASS report when all rules pass', () => {
		const results: RuleResult[] = [
			{ rule_id: 'r1', rule_name: 'Rule 1', severity: 'high', result: 'PASS' },
			{ rule_id: 'r2', rule_name: 'Rule 2', severity: 'medium', result: 'PASS' },
		];

		const report = generateReport(mockPack, results, mockScore, mockHash);
		expect(report.overall_result).toBe('PASS');
		expect(report.recommendations).toHaveLength(0);
		expect(report.governance_pack).toBe('test-pack');
		expect(report.governance_version).toBe('1.0.0');
	});

	it('generates a FAIL report when critical rules fail', () => {
		const results: RuleResult[] = [
			{ rule_id: 'r1', rule_name: 'Critical Rule', severity: 'critical', result: 'FAIL', message: 'Missing required field' },
			{ rule_id: 'r2', rule_name: 'Rule 2', severity: 'medium', result: 'PASS' },
		];

		const report = generateReport(mockPack, results, mockScore, mockHash);
		expect(report.overall_result).toBe('FAIL');
		expect(report.recommendations.length).toBeGreaterThan(0);
		expect(report.recommendations[0]).toContain('[CRITICAL]');
	});

	it('generates a PARTIAL report when non-critical rules fail', () => {
		const results: RuleResult[] = [
			{ rule_id: 'r1', rule_name: 'Rule 1', severity: 'high', result: 'PASS' },
			{ rule_id: 'r2', rule_name: 'Rule 2', severity: 'medium', result: 'FAIL', message: 'Issue found' },
		];

		const report = generateReport(mockPack, results, mockScore, mockHash);
		expect(report.overall_result).toBe('PARTIAL');
		expect(report.recommendations).toHaveLength(1);
		expect(report.recommendations[0]).toContain('[MEDIUM]');
	});

	it('generates recommendations for each severity level', () => {
		const results: RuleResult[] = [
			{ rule_id: 'r1', rule_name: 'R1', severity: 'critical', result: 'FAIL' },
			{ rule_id: 'r2', rule_name: 'R2', severity: 'high', result: 'FAIL' },
			{ rule_id: 'r3', rule_name: 'R3', severity: 'medium', result: 'FAIL' },
			{ rule_id: 'r4', rule_name: 'R4', severity: 'low', result: 'FAIL' },
		];

		const report = generateReport(mockPack, results, mockScore, mockHash);
		expect(report.recommendations).toHaveLength(4);
		expect(report.recommendations[0]).toContain('[CRITICAL]');
		expect(report.recommendations[1]).toContain('[HIGH]');
		expect(report.recommendations[2]).toContain('[MEDIUM]');
		expect(report.recommendations[3]).toContain('[LOW]');
	});

	it('skips SKIPped rules in result determination', () => {
		const results: RuleResult[] = [
			{ rule_id: 'r1', rule_name: 'Rule 1', severity: 'critical', result: 'SKIP' },
			{ rule_id: 'r2', rule_name: 'Rule 2', severity: 'high', result: 'PASS' },
		];

		const report = generateReport(mockPack, results, mockScore, mockHash);
		expect(report.overall_result).toBe('PASS');
	});

	it('includes proof hash in report', () => {
		const report = generateReport(mockPack, [], mockScore, mockHash);
		expect(report.proof_hash).toEqual(mockHash);
	});
});
