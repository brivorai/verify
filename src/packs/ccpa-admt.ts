/**
 * CCPA/CPRA Automated Decision-Making Technology (ADMT) Governance Pack
 *
 * Implements Article 11 (Sections 7200-7222) consumer protection requirements
 * for businesses using ADMT to make significant decisions. Covers pre-use
 * notice, opt-out mechanisms, consumer access rights, risk assessment
 * documentation, PII handling, and human involvement verification.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const ccpaAdmt: GovernancePack = {
	name: 'ccpa-admt',
	version: '1.0.0',
	description:
		'CCPA/CPRA Automated Decision-Making Technology (ADMT) governance pack implementing Article 11 (Sections 7200-7222) consumer protection requirements. Covers pre-use notice, opt-out mechanisms, consumer access rights, risk assessment documentation, PII handling, and human involvement verification. Based on final regulations approved September 22, 2025, effective January 1, 2026 (ADMT requirements effective January 1, 2027).',
	rules: [
		{
			id: 'ccpa-admt-001',
			name: 'Pre-Use Notice Required Before ADMT Processing',
			description:
				'Section 7220 requires a pre-use notice at or before personal information collection for ADMT use. Must include specific purpose, ADMT logic, consumer rights, alternative process, and non-retaliation statement.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['pre_use_notice'],
			},
		},
		{
			id: 'ccpa-admt-002',
			name: 'ADMT Purpose Must Be Specific and Non-Generic',
			description:
				"Section 7220 prohibits generic purpose statements like 'to make a significant decision' or 'to improve services'. Purpose must be specific to the actual use case.",
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'length',
				field: 'processing_purpose',
				min: 20,
				max: 2000,
			},
		},
		{
			id: 'ccpa-admt-003',
			name: 'Consumer Opt-Out Mechanism for ADMT',
			description:
				'Section 7221 requires at least two opt-out methods. One must match primary consumer interaction. No account creation or full verification required. Must cease processing within 15 business days.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['opt_out_mechanism'],
			},
		},
		{
			id: 'ccpa-admt-004',
			name: 'Verify Consumer Has Not Opted Out of ADMT',
			description:
				'Before ADMT processing, verify consumer has not exercised opt-out rights under Section 7221. If opted out, must use alternative process. Cannot re-request consent for 12 months.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['consumer_opt_out_status'],
			},
		},
		{
			id: 'ccpa-admt-005',
			name: 'Personal Information Minimization for ADMT Processing',
			description:
				'Section 7152 requires documenting minimum necessary PI. Sensitive PI (geolocation, race, religion, genetic, biometric, health, sexual orientation, citizenship, minor data) triggers heightened obligations.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'ccpa-admt-006',
			name: 'ADMT Decision Logic Explainability',
			description:
				'Section 7222 requires plain-language explanation of ADMT purpose, logic, key parameters, PI used, output generated, decision influence, sole-factor status, and human involvement role upon consumer request.',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'decision_explanation',
					'key_parameters',
					'personal_information_used',
					'output_generated',
					'human_involvement_role',
				],
			},
		},
		{
			id: 'ccpa-admt-007',
			name: 'Human Involvement Standards Verification',
			description:
				'Human involvement requires ALL three criteria: (1) interpreter competency, (2) affirmative review/analysis, (3) actual override authority. Failure triggers full ADMT obligations.',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'reviewer_competency_verified',
					'affirmative_review_completed',
					'override_authority_confirmed',
				],
			},
		},
		{
			id: 'ccpa-admt-008',
			name: 'ADMT Risk Assessment Completeness',
			description:
				'Sections 7150-7152 require risk assessment documenting: purpose, PI categories, operations, sources, retention, benefits, negative impacts, safeguards (including ADMT-specific), and executive attestation. Review every 3 years or 45 days after material change.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'risk_assessment_id',
					'processing_purpose',
					'pi_categories',
					'processing_operations',
					'data_sources',
					'retention_period',
					'benefits_analysis',
					'negative_impact_analysis',
					'safeguards',
					'admt_specific_safeguards',
					'assessment_date',
					'next_review_date',
					'executive_attestor',
				],
			},
		},
		{
			id: 'ccpa-admt-009',
			name: 'Significant Decision Domain Classification',
			description:
				'Section 7200 requires classification into recognized domains: financial/lending, housing, insurance, education, employment, healthcare, criminal justice, or essential services. Advertising excluded.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'contains',
				field: 'decision_domain',
				values: [
					'financial_lending',
					'housing',
					'insurance',
					'education',
					'employment',
					'healthcare',
					'criminal_justice',
					'essential_services',
				],
			},
		},
		{
			id: 'ccpa-admt-010',
			name: 'ADMT Access Request Response Timeline',
			description:
				'Section 7222(e) requires receipt confirmation within 10 business days and full response within 45 calendar days (90 with extension). Full identity verification under Article 5 required.',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'custom',
				fn: 'response_timeliness',
			},
		},
		{
			id: 'ccpa-admt-011',
			name: 'ADMT Bias and Discrimination Risk Mitigation',
			description:
				'Section 7152 mandates evaluation of bias risk in data inputs, model design, and deployment. Must document potential discriminatory impacts across protected classes and implement safeguards.',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'bias_detection',
				protected_attributes: [
					'race',
					'color',
					'national_origin',
					'sex',
					'gender_identity',
					'sexual_orientation',
					'age',
					'disability',
					'religion',
					'genetic_information',
					'marital_status',
					'veteran_status',
				],
			},
		},
		{
			id: 'ccpa-admt-012',
			name: 'ADMT Processing Record Retention',
			description:
				'Retain risk assessments (original and updates) for 5 years or duration of processing, whichever is longer. Attestation submissions to CPPA due April 1, 2028. CPPA/AG may request copies during audits.',
			phase: 'post',
			severity: 'medium',
			evaluate: {
				type: 'custom',
				fn: 'record_retention',
			},
		},
	],
	scoring: {
		dimensions: [
			{
				name: 'notice_transparency',
				rules: ['ccpa-admt-001', 'ccpa-admt-002', 'ccpa-admt-009'],
			},
			{
				name: 'consumer_rights',
				rules: ['ccpa-admt-003', 'ccpa-admt-004', 'ccpa-admt-006', 'ccpa-admt-010'],
			},
			{
				name: 'risk_governance',
				rules: ['ccpa-admt-007', 'ccpa-admt-008', 'ccpa-admt-012'],
			},
			{
				name: 'data_protection',
				rules: ['ccpa-admt-005', 'ccpa-admt-011'],
			},
		],
		threshold: 0.85,
		weights: {
			notice_transparency: 0.25,
			consumer_rights: 0.25,
			risk_governance: 0.25,
			data_protection: 0.25,
		},
	},
	metadata: {
		regulation: 'CCPA/CPRA Automated Decision-Making Technology Regulations',
		statute: 'Cal. Civ. Code Section 1798.100 et seq.',
		regulations: '11 CCR 7150-7222 (Articles 10-11)',
		jurisdiction: 'US-CA',
		effective_date: '2026-01-01',
		admt_compliance_date: '2027-01-01',
		enforcement: 'California Privacy Protection Agency (CPPA) and California Attorney General',
		penalty_max: '$7,500 per violation (intentional)',
		cure_period: 'None',
		last_updated: '2026-02-18',
	},
};
