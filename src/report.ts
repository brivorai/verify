/**
 * @brivora/verify — Compliance report generation
 *
 * Generates human-readable compliance reports from rule results.
 * @module
 */

import type {
	ComplianceReport,
	ContentHash,
	FidelityScore,
	GovernancePack,
	RuleResult,
} from './types.js';

/**
 * Determine the overall result from rule results.
 */
function determineOverallResult(ruleResults: RuleResult[]): 'PASS' | 'FAIL' | 'PARTIAL' {
	const applicable = ruleResults.filter((r) => r.result !== 'SKIP');
	if (applicable.length === 0) return 'PASS';

	const failed = applicable.filter((r) => r.result === 'FAIL');
	if (failed.length === 0) return 'PASS';

	// If any critical rule failed → FAIL
	const criticalFails = failed.filter((r) => r.severity === 'critical');
	if (criticalFails.length > 0) return 'FAIL';

	// Some failures but no critical → PARTIAL
	return 'PARTIAL';
}

/**
 * Generate recommendations based on failed rules.
 */
function generateRecommendations(ruleResults: RuleResult[]): string[] {
	const recommendations: string[] = [];
	const failed = ruleResults.filter((r) => r.result === 'FAIL');

	for (const result of failed) {
		switch (result.severity) {
			case 'critical':
				recommendations.push(
					`[CRITICAL] ${result.rule_name}: ${result.message ?? 'Compliance requirement not met'}. This must be resolved before deployment.`,
				);
				break;
			case 'high':
				recommendations.push(
					`[HIGH] ${result.rule_name}: ${result.message ?? 'Compliance issue detected'}. Resolution strongly recommended.`,
				);
				break;
			case 'medium':
				recommendations.push(
					`[MEDIUM] ${result.rule_name}: ${result.message ?? 'Potential compliance gap'}. Review recommended.`,
				);
				break;
			case 'low':
				recommendations.push(
					`[LOW] ${result.rule_name}: ${result.message ?? 'Minor compliance note'}. Consider addressing.`,
				);
				break;
		}
	}

	return recommendations;
}

/**
 * Generate a compliance report from governance evaluation results.
 */
export function generateReport(
	pack: GovernancePack,
	ruleResults: RuleResult[],
	fidelityScore: FidelityScore,
	proofHash: ContentHash,
	timestamp?: string,
): ComplianceReport {
	const overallResult = determineOverallResult(ruleResults);
	const recommendations = generateRecommendations(ruleResults);

	return {
		timestamp: timestamp ?? new Date().toISOString(),
		governance_pack: pack.name,
		governance_version: pack.version,
		overall_result: overallResult,
		fidelity_score: fidelityScore,
		rule_results: ruleResults,
		recommendations,
		proof_hash: proofHash,
	};
}
