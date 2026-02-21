/**
 * NYDFS AI Governance Pack
 *
 * Enforces NYDFS Insurance Circular Letter No. 7 (2024) on use of
 * AI systems and external consumer data in insurance underwriting
 * and pricing, plus Industry Letter on AI cybersecurity risks
 * (October 2024). Covers fair lending, model governance, consumer
 * protection, and 23 NYCRR 500 cybersecurity alignment.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const nydfsAi: GovernancePack = {
	name: 'nydfs-ai',
	version: '1.0.0',
	description:
		'NYDFS AI governance compliance pack. Enforces Insurance Circular Letter No. 7 (2024): AI systems and external consumer data (ECDIS) in insurance underwriting/pricing, unfair discrimination analysis, actuarial validity demonstration, governance frameworks, transparency, and 23 NYCRR 500 cybersecurity requirements for AI systems.',
	rules: [
		{
			id: 'nydfs-ai-discrimination-analysis',
			name: 'Unfair Discrimination Analysis',
			description:
				'Verify analysis of AI systems and external consumer data for unfair and unlawful discrimination per Circular Letter No. 7 (2024). Insurers must demonstrate AIS/ECDIS do not result in unfair discrimination.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'discrimination_analysis_completed',
					'protected_classes_tested',
					'disparate_impact_assessment',
				],
			},
		},
		{
			id: 'nydfs-ai-actuarial-validity',
			name: 'Actuarial Validity Demonstration',
			description:
				'Verify actuarial validity of AI systems and external consumer data used in underwriting/pricing per Circular Letter No. 7. Models must be actuarially justified.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['actuarial_validity_documented', 'model_validation_completed'],
			},
		},
		{
			id: 'nydfs-ai-governance-framework',
			name: 'AI Governance Framework',
			description:
				'Verify governance framework for oversight of AI/ECDIS outcomes per Circular Letter No. 7, including board or senior management oversight',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'governance_framework_established',
					'oversight_responsibility_assigned',
					'review_frequency_defined',
				],
			},
		},
		{
			id: 'nydfs-ai-third-party-oversight',
			name: 'Third-Party Vendor AI Oversight',
			description:
				'Verify oversight of third-party AI vendors per Circular Letter No. 7. Insurers cannot delegate compliance obligations to vendors.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['vendor_ai_assessed', 'vendor_oversight_documented'],
			},
		},
		{
			id: 'nydfs-ai-consumer-disclosure',
			name: 'Consumer Disclosure and Transparency',
			description:
				'Verify appropriate consumer disclosures regarding AI use in underwriting and pricing decisions per Circular Letter No. 7 transparency requirements',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['consumer_disclosure_provided', 'adverse_action_notice'],
			},
		},
		{
			id: 'nydfs-ai-model-risk-management',
			name: 'Model Risk Management',
			description:
				'Verify model risk management practices including validation, testing, and ongoing monitoring per NYDFS expectations and SR 11-7 alignment',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['model_risk_management_policy', 'model_validation_process', 'ongoing_monitoring'],
			},
		},
		{
			id: 'nydfs-ai-cybersecurity-controls',
			name: 'AI Cybersecurity Controls',
			description:
				'Verify cybersecurity controls for AI systems per Industry Letter (October 2024) and 23 NYCRR 500. Covered entities must address AI-related cyber risks.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['ai_cyber_risk_assessment', 'access_controls_implemented'],
			},
		},
		{
			id: 'nydfs-ai-bias-detection',
			name: 'Runtime Bias Detection',
			description:
				'Monitor AI outputs for potential discriminatory patterns across protected classes per Circular Letter No. 7 fair insurance requirements',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'bias_detection',
				protected_attributes: ['race', 'sex', 'age', 'disability', 'national_origin', 'religion'],
			},
		},
		{
			id: 'nydfs-ai-pii-detection',
			name: 'Consumer PII Detection',
			description:
				'Detect consumer PII in AI inputs to support data minimization and privacy obligations under NYDFS regulations',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'nydfs-ai-audit-trail',
			name: 'Regulatory Audit Trail',
			description:
				'Maintain complete audit records for AI-driven insurance decisions to support NYDFS examination and enforcement requirements',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'request_id',
					'timestamp',
					'model',
					'decision_type',
					'evaluation_result',
					'governance_policy',
				],
			},
		},
	],
	scoring: {
		dimensions: [
			{
				name: 'fair_insurance',
				rules: [
					'nydfs-ai-discrimination-analysis',
					'nydfs-ai-actuarial-validity',
					'nydfs-ai-bias-detection',
				],
			},
			{
				name: 'governance_oversight',
				rules: [
					'nydfs-ai-governance-framework',
					'nydfs-ai-third-party-oversight',
					'nydfs-ai-model-risk-management',
				],
			},
			{
				name: 'transparency_privacy',
				rules: ['nydfs-ai-consumer-disclosure', 'nydfs-ai-pii-detection'],
			},
			{
				name: 'security_compliance',
				rules: ['nydfs-ai-cybersecurity-controls', 'nydfs-ai-audit-trail'],
			},
		],
		threshold: 0.85,
		weights: {
			fair_insurance: 0.35,
			governance_oversight: 0.3,
			transparency_privacy: 0.15,
			security_compliance: 0.2,
		},
	},
	metadata: {
		regulation: 'NYDFS Insurance Circular Letter No. 7 (2024) & AI Cybersecurity Industry Letter',
		circular_letter: 'CL 2024-07 (July 11, 2024)',
		industry_letter: 'IL 2024-10-16 (October 16, 2024)',
		jurisdiction: 'US-NY',
		effective_date: '2024-07-11',
		status: 'enforceable',
		enforcement: 'New York Department of Financial Services (NYDFS)',
		scope: 'Licensed insurers, Article 43 corporations, HMOs operating in New York',
		cybersecurity_regulation: '23 NYCRR 500',
		note: 'Circular Letter is guidance with regulatory force — sets NYDFS examination expectations',
	},
};
