/**
 * NYC Local Law 144 (Int 1894-2020) AEDT Governance Pack
 *
 * Enforces requirements for automated employment decision tools (AEDTs)
 * used in New York City including mandatory bias audits, notice
 * requirements, and candidate rights per NYC Admin. Code 20-870 to 20-874.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const nycLl144: GovernancePack = {
	name: 'nyc-ll144',
	version: '1.0.0',
	description:
		'NYC Local Law 144 (Int 1894-2020) compliance pack for Automated Employment Decision Tools (AEDTs). Enforces mandatory independent bias audits (Sec. 20-871), candidate/employee notice requirements (Sec. 20-872), data collection transparency, and disparate impact analysis per NYC Admin. Code 20-870 to 20-874 and DCWP Rules.',
	rules: [
		{
			id: 'll144-bias-audit-requirement',
			name: 'Independent Bias Audit Completion',
			description:
				'Verify an independent bias audit has been conducted within the past year per Sec. 20-871(a). Audit must be conducted by an independent auditor and results published on employer/agency website.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'bias_audit_date',
					'bias_audit_auditor',
					'bias_audit_published',
					'audit_validity_period',
				],
			},
		},
		{
			id: 'll144-impact-ratio-sex',
			name: 'Disparate Impact Ratio — Sex Categories',
			description:
				'Verify selection rate and scoring rate impact ratios calculated for sex categories per DCWP Rules Sec. 5-303. Must report impact ratios comparing selection/scoring rates of each sex category to the most selected/scored category.',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['impact_ratio_sex', 'selection_rate_sex', 'scoring_rate_sex'],
			},
		},
		{
			id: 'll144-impact-ratio-race',
			name: 'Disparate Impact Ratio — Race/Ethnicity Categories',
			description:
				'Verify selection rate and scoring rate impact ratios calculated for race/ethnicity categories per DCWP Rules Sec. 5-303. Must use EEOC race/ethnicity categories.',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['impact_ratio_race_ethnicity', 'selection_rate_race', 'scoring_rate_race'],
			},
		},
		{
			id: 'll144-intersectional-analysis',
			name: 'Intersectional Category Analysis',
			description:
				'Verify intersectional analysis of impact ratios across sex and race/ethnicity categories per DCWP Rules Sec. 5-303(d). Must calculate impact ratios for each combination.',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['intersectional_impact_ratios', 'intersectional_categories_analyzed'],
			},
		},
		{
			id: 'll144-candidate-notice-10day',
			name: 'Candidate Notice — 10 Business Days',
			description:
				'Verify candidates/employees are notified at least 10 business days before AEDT use per Sec. 20-872(a). Notice must specify the AEDT will be used and the job qualifications/characteristics it will assess.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'candidate_notice_provided',
					'notice_date',
					'aedt_use_disclosed',
					'qualifications_assessed_disclosed',
				],
			},
		},
		{
			id: 'll144-alternative-process-notice',
			name: 'Alternative Process Notice',
			description:
				'Verify notice informs candidates of right to request alternative selection process or reasonable accommodation per Sec. 20-872(a). Employer not required to provide one, but must inform of the right.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['alternative_process_disclosed', 'accommodation_info_provided'],
			},
		},
		{
			id: 'll144-data-collection-notice',
			name: 'Data Collection Transparency Notice',
			description:
				'Verify notice about data collected and its retention/use per Sec. 20-872(b). Must disclose data sources, types collected, and data retention policy.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['data_types_collected', 'data_sources_disclosed', 'data_retention_policy'],
			},
		},
		{
			id: 'll144-audit-publication',
			name: 'Bias Audit Results Publication',
			description:
				'Verify bias audit summary results are publicly posted on employer/agency website per Sec. 20-871(b) and DCWP Rules Sec. 5-304. Must be available before AEDT use.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['audit_summary_url', 'publication_date', 'audit_results_accessible'],
			},
		},
		{
			id: 'll144-aedt-classification',
			name: 'AEDT Definition Compliance',
			description:
				'Verify the tool meets the AEDT definition per Sec. 20-870: computational process derived from machine learning, statistical modeling, data analytics, or AI that issues simplified output used to substantially assist or replace discretionary decision-making.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['aedt_classification', 'decision_type', 'automation_level'],
			},
		},
		{
			id: 'll144-bias-detection-runtime',
			name: 'Runtime Bias Monitoring',
			description:
				'Monitor AEDT outputs for potential bias in real-time across protected categories per bias audit framework requirements',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'bias_detection',
				protected_attributes: ['race', 'ethnicity', 'sex', 'gender'],
			},
		},
		{
			id: 'll144-pii-detection',
			name: 'Candidate PII Detection',
			description:
				'Detect personally identifiable information in AEDT inputs to ensure compliance with data minimization principles per Sec. 20-872(b)',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'll144-audit-trail',
			name: 'AEDT Decision Audit Trail',
			description:
				'Ensure complete audit records for AEDT decisions to support bias audit and enforcement requirements per Sec. 20-873',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'request_id',
					'timestamp',
					'model',
					'decision_type',
					'candidate_category',
					'output_score',
					'governance_policy',
				],
			},
		},
	],
	scoring: {
		dimensions: [
			{
				name: 'bias_audit_compliance',
				rules: [
					'll144-bias-audit-requirement',
					'll144-impact-ratio-sex',
					'll144-impact-ratio-race',
					'll144-intersectional-analysis',
					'll144-audit-publication',
				],
			},
			{
				name: 'notice_requirements',
				rules: [
					'll144-candidate-notice-10day',
					'll144-alternative-process-notice',
					'll144-data-collection-notice',
				],
			},
			{
				name: 'operational_monitoring',
				rules: ['ll144-bias-detection-runtime', 'll144-aedt-classification', 'll144-audit-trail'],
			},
			{
				name: 'data_protection',
				rules: ['ll144-pii-detection', 'll144-data-collection-notice'],
			},
		],
		threshold: 0.85,
		weights: {
			bias_audit_compliance: 0.4,
			notice_requirements: 0.25,
			operational_monitoring: 0.2,
			data_protection: 0.15,
		},
	},
	metadata: {
		regulation: 'NYC Local Law 144 (Int 1894-2020)',
		code: 'NYC Admin. Code 20-870 to 20-874',
		jurisdiction: 'US-NY-NYC',
		effective_date: '2023-07-05',
		status: 'enforceable',
		enforcement: 'NYC Department of Consumer and Worker Protection (DCWP)',
		penalty_first_violation: '$500',
		penalty_subsequent: '$500-$1,500 per violation',
		scope: 'Employers and employment agencies using AEDTs in NYC',
		bias_audit_frequency: 'Annual (within 1 year of use)',
		notice_period_business_days: 10,
	},
};
