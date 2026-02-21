/**
 * Canada Artificial Intelligence and Data Act (AIDA) Governance Pack
 *
 * Based on the proposed AIDA (Part 3 of Bill C-27) which died on
 * the order paper when Parliament was prorogued January 6, 2025.
 * AIDA has NOT been enacted. This pack implements the proposed
 * requirements for high-impact AI systems as a forward-looking
 * compliance framework for anticipated Canadian AI legislation.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const canadaAida: GovernancePack = {
	name: 'canada-aida',
	version: '1.0.0',
	description:
		'Canada AI governance compliance pack based on proposed AIDA (Bill C-27, Part 3). AIDA died on order paper January 6, 2025 when Parliament prorogued. Pack implements proposed requirements for high-impact AI systems as forward-looking framework: impact assessments, risk mitigation, transparency, record-keeping, and reporting obligations. Status: anticipated — not enacted.',
	rules: [
		{
			id: 'ca-aida-high-impact-classification',
			name: 'High-Impact AI System Classification',
			description:
				'Classify AI system as high-impact per proposed AIDA criteria. High-impact systems include those used in employment, services, biometrics, critical infrastructure, and other areas with significant impact on individuals.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['ai_impact_classification', 'high_impact_determination', 'use_case_category'],
			},
		},
		{
			id: 'ca-aida-impact-assessment',
			name: 'Impact Assessment',
			description:
				'Verify impact assessment for high-impact AI systems per proposed AIDA. Must assess potential for harm, biased output, and effectiveness of mitigation measures.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'impact_assessment_completed',
					'harm_potential_evaluated',
					'mitigation_effectiveness',
				],
			},
		},
		{
			id: 'ca-aida-risk-mitigation',
			name: 'Risk Mitigation Measures',
			description:
				'Verify risk mitigation measures for high-impact AI systems per proposed AIDA. Must establish measures to mitigate risks of harm or biased output.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'risk_mitigation_plan',
					'mitigation_measures_implemented',
					'monitoring_established',
				],
			},
		},
		{
			id: 'ca-aida-transparency',
			name: 'Transparency Obligations',
			description:
				'Verify transparency measures per proposed AIDA. Persons responsible for high-impact AI must make publicly available a plain-language description of the system.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['public_description_available', 'plain_language_explanation'],
			},
		},
		{
			id: 'ca-aida-notification',
			name: 'AI Interaction Notification',
			description:
				'Verify individuals are notified when AI is used to make decisions or predictions about them per proposed AIDA transparency requirements',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['ai_use_notified', 'notification_method'],
			},
		},
		{
			id: 'ca-aida-record-keeping',
			name: 'Record-Keeping Obligations',
			description:
				'Verify record-keeping for high-impact AI systems per proposed AIDA. Must maintain records of assessments, mitigation measures, and system performance.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['records_maintained', 'assessment_records', 'performance_records'],
			},
		},
		{
			id: 'ca-aida-harm-reporting',
			name: 'Harm Reporting',
			description:
				'Verify reporting mechanisms for material harm caused by AI systems per proposed AIDA. Must report to Commissioner when aware of serious harm.',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['harm_reporting_process', 'escalation_procedure'],
			},
		},
		{
			id: 'ca-aida-bias-monitoring',
			name: 'Bias and Discrimination Monitoring',
			description:
				'Monitor AI outputs for biased output per proposed AIDA. AIDA specifically prohibited making available AI systems that could result in serious harm.',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'bias_detection',
				protected_attributes: ['race', 'sex', 'age', 'disability', 'national_origin', 'religion'],
			},
		},
		{
			id: 'ca-aida-content-safety',
			name: 'Content Safety Screening',
			description: 'Screen AI outputs for harmful content per proposed AIDA safety framework',
			phase: 'post',
			severity: 'medium',
			evaluate: {
				type: 'toxicity_threshold',
				max_score: 0.7,
			},
		},
		{
			id: 'ca-aida-pii-protection',
			name: 'Personal Information Protection',
			description:
				'Detect PII in AI inputs per PIPEDA/proposed CPPA alignment. Canadian privacy protections apply to AI data processing.',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'ca-aida-audit-trail',
			name: 'Compliance Audit Trail',
			description:
				'Maintain audit records for AI operations to support proposed AIDA record-keeping and reporting requirements',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'request_id',
					'timestamp',
					'model',
					'evaluation_result',
					'score',
					'governance_policy',
				],
			},
		},
	],
	scoring: {
		dimensions: [
			{
				name: 'risk_management',
				rules: [
					'ca-aida-high-impact-classification',
					'ca-aida-impact-assessment',
					'ca-aida-risk-mitigation',
				],
			},
			{
				name: 'transparency',
				rules: ['ca-aida-transparency', 'ca-aida-notification'],
			},
			{
				name: 'safety_fairness',
				rules: ['ca-aida-bias-monitoring', 'ca-aida-content-safety', 'ca-aida-harm-reporting'],
			},
			{
				name: 'compliance_operations',
				rules: ['ca-aida-record-keeping', 'ca-aida-pii-protection', 'ca-aida-audit-trail'],
			},
		],
		threshold: 0.75,
		weights: {
			risk_management: 0.3,
			transparency: 0.2,
			safety_fairness: 0.25,
			compliance_operations: 0.25,
		},
	},
	metadata: {
		regulation: 'Artificial Intelligence and Data Act (AIDA) — Proposed',
		bill: 'Bill C-27, Part 3',
		jurisdiction: 'CA',
		effective_date: 'Not enacted',
		status: 'anticipated',
		enforcement: 'AI and Data Commissioner (proposed)',
		scope: 'High-impact AI systems in Canada',
		legislative_status: 'Died on order paper — Parliament prorogued January 6, 2025',
		penalty_max: 'Up to $10M CAD or 3% of global revenue (proposed)',
		criminal_penalty: 'Up to $25M CAD or 5% of global revenue for knowing harm (proposed)',
		private_right_of_action: false,
		voluntary_code: 'Government launched Voluntary Code of Conduct on AI (2023) as interim measure',
		note: 'AIDA was not enacted. This pack provides forward-looking compliance for anticipated Canadian AI legislation. Requirements based on Bill C-27 text as introduced.',
	},
};
