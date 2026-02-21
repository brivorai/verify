/**
 * ISO/IEC 42001:2023 AI Management System Governance Pack
 *
 * Enforces AI management system requirements per ISO/IEC 42001:2023
 * including Clauses 4-10 (management system) and Annex A reference
 * controls across 9 domains: policy, organization, resources,
 * lifecycle, data, transparency, use, third-party, and operations.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const iso42001: GovernancePack = {
	name: 'iso-42001',
	version: '1.0.0',
	description:
		'ISO/IEC 42001:2023 AI Management System compliance pack. Enforces AIMS requirements per Clauses 4-10 and Annex A reference controls: AI policy (A.2), internal organization (A.3), resources (A.4), lifecycle management (A.5), data governance (A.6), transparency (A.7), responsible use (A.8), third-party management (A.9), and operational monitoring.',
	rules: [
		{
			id: 'iso42001-ai-policy-documentation',
			name: 'AI Policy Documentation',
			description:
				'Verify a documented AI policy establishing management direction and commitment for responsible AI per Clause 5.2 and Annex A.2. This is the foundation of the entire AIMS.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['ai_policy_documented', 'policy_scope', 'policy_approval_date'],
			},
		},
		{
			id: 'iso42001-risk-assessment',
			name: 'AI Risk Assessment',
			description:
				'Verify AI-specific risk assessment with documented methodology and treatment plans per Clause 6.1 and Clause 8.2. Core auditable requirement for AIMS certification.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['risk_assessment_completed', 'risk_methodology', 'risk_treatment_plan'],
			},
		},
		{
			id: 'iso42001-statement-of-applicability',
			name: 'Statement of Applicability',
			description:
				'Verify Statement of Applicability documenting which Annex A controls are applicable and justifying exclusions per Clause 6.1.3. Auditors check this first during certification.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['soa_documented', 'controls_selected', 'exclusion_justifications'],
			},
		},
		{
			id: 'iso42001-roles-responsibilities',
			name: 'AI Governance Roles and Responsibilities',
			description:
				'Verify clearly defined and assigned responsibilities for AI governance activities per Clause 5.3 and Annex A.3',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['ai_governance_roles', 'responsibility_assignments'],
			},
		},
		{
			id: 'iso42001-ai-impact-assessment',
			name: 'AI System Impact Assessment',
			description:
				'Verify AI system impact assessments evaluating effects on individuals and society throughout the lifecycle per Clause 8.4 and Annex A.5',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'impact_assessment_completed',
					'affected_individuals_identified',
					'societal_impact_evaluated',
				],
			},
		},
		{
			id: 'iso42001-data-governance',
			name: 'Data Governance for AI Systems',
			description:
				'Verify data quality measures, provenance documentation, and bias assessment per Annex A.6. Organizations must understand the role and impact of data in their AI systems.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['data_quality_measures', 'data_provenance_documented', 'data_bias_assessment'],
			},
		},
		{
			id: 'iso42001-transparency-disclosure',
			name: 'Transparency and Disclosure',
			description:
				'Verify interested parties receive necessary information to understand and assess risks per Annex A.7, including system purpose, capabilities, and limitations',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['system_purpose_documented', 'ai_disclosure_provided', 'limitations_documented'],
			},
		},
		{
			id: 'iso42001-responsible-use',
			name: 'Responsible Use Documentation',
			description:
				'Verify documented policies, procedures, and objectives for responsible use of AI systems per Annex A.8, including intended use definition and misuse prevention',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['use_policy_documented', 'intended_use_defined', 'misuse_prevention'],
			},
		},
		{
			id: 'iso42001-bias-fairness-monitoring',
			name: 'Bias and Fairness Monitoring',
			description:
				'Monitor AI outputs for bias and fairness throughout the system lifecycle per Annex A.5 lifecycle management and A.6 data governance controls',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'bias_detection',
				protected_attributes: ['race', 'sex', 'age', 'disability', 'religion', 'national_origin'],
			},
		},
		{
			id: 'iso42001-performance-monitoring',
			name: 'Performance Monitoring and Evaluation',
			description:
				'Verify performance metrics are defined and monitored per Clause 9.1, including measurement methods, frequency, and analysis of results',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['performance_metrics_defined', 'monitoring_frequency', 'evaluation_results'],
			},
		},
		{
			id: 'iso42001-third-party-management',
			name: 'Third-Party AI Management',
			description:
				'Verify clear delineation of responsibilities between the organization, partners, suppliers, and customers for AI systems per Annex A.9',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'required',
				fields: ['third_party_ai_assessed', 'vendor_responsibilities_defined'],
			},
		},
		{
			id: 'iso42001-content-safety',
			name: 'Content Safety Monitoring',
			description:
				'Screen AI outputs for safety and robustness per Annex A.5 lifecycle controls. Content safety screening supports ongoing monitoring obligations.',
			phase: 'post',
			severity: 'medium',
			evaluate: {
				type: 'toxicity_threshold',
				max_score: 0.7,
			},
		},
		{
			id: 'iso42001-pii-protection',
			name: 'Personal Data Protection',
			description:
				'Detect PII in AI inputs to support data governance and privacy compliance per Annex A.6 data governance controls',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'iso42001-audit-trail',
			name: 'AIMS Audit Trail',
			description:
				'Maintain complete audit records for AI governance activities per Clause 9.2 (internal audit) and Clause 7.5 (documented information) for certification evidence',
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
				name: 'governance_framework',
				rules: [
					'iso42001-ai-policy-documentation',
					'iso42001-roles-responsibilities',
					'iso42001-statement-of-applicability',
					'iso42001-responsible-use',
				],
			},
			{
				name: 'risk_management',
				rules: [
					'iso42001-risk-assessment',
					'iso42001-ai-impact-assessment',
					'iso42001-third-party-management',
				],
			},
			{
				name: 'transparency_fairness',
				rules: [
					'iso42001-transparency-disclosure',
					'iso42001-data-governance',
					'iso42001-bias-fairness-monitoring',
					'iso42001-pii-protection',
				],
			},
			{
				name: 'operational_controls',
				rules: [
					'iso42001-performance-monitoring',
					'iso42001-content-safety',
					'iso42001-audit-trail',
				],
			},
		],
		threshold: 0.8,
		weights: {
			governance_framework: 0.3,
			risk_management: 0.25,
			transparency_fairness: 0.25,
			operational_controls: 0.2,
		},
	},
	metadata: {
		regulation: 'ISO/IEC 42001:2023 AI Management System',
		standard: 'ISO/IEC 42001:2023',
		jurisdiction: 'International',
		effective_date: '2023-12-18',
		status: 'voluntary',
		publisher: 'ISO/IEC JTC 1/SC 42',
		certification_cycle: '3-year certification with annual surveillance audits',
		related_standards: 'ISO/IEC 22989, ISO/IEC 23894, ISO 27001, ISO 27701',
		scope: 'Organizations developing, providing, or using AI systems',
	},
};
