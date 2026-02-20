/**
 * Colorado AI Act (SB 24-205) Governance Pack
 *
 * Enforces algorithmic discrimination prevention, impact assessment
 * documentation, consumer notification, and bias detection requirements
 * for high-risk AI systems making consequential decisions.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const coloradoAiAct: GovernancePack = {
	name: 'colorado-ai-act',
	version: '1.0.0',
	description:
		'Colorado AI Act (SB 24-205) compliance pack for high-risk AI systems making consequential decisions. Enforces algorithmic discrimination prevention, impact assessment documentation, consumer notification, and bias detection per C.R.S. 6-1-1701 through 6-1-1707.',
	rules: [
		{
			id: 'co-bias-detection',
			name: 'Algorithmic Discrimination Detection',
			description:
				'Detect protected class attribute references in AI inputs/outputs that could indicate algorithmic discrimination per C.R.S. 6-1-1701(1)',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'bias_detection',
				protected_attributes: [
					'age',
					'race',
					'color',
					'ethnicity',
					'sex',
					'gender',
					'sexual_orientation',
					'gender_identity',
					'religion',
					'national_origin',
					'disability',
					'genetic_information',
					'veteran_status',
					'english_proficiency',
					'reproductive_health',
				],
			},
		},
		{
			id: 'co-consequential-decision-detection',
			name: 'Consequential Decision Category Detection',
			description:
				'Detect when AI is used for consequential decisions in the 8 statutory categories per C.R.S. 6-1-1701(2)(a)-(h)',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'regex',
				field: 'input',
				pattern:
					'(?i)(loan|credit|mortgage|underwrit|hiring|employ|candidate|admission|enrollment|scholarship|financial\\s*aid|insurance|housing|tenant|evict|diagnos|treatment|patient|benefit|government\\s*service|legal|bail|sentenc|parole)',
			},
		},
		{
			id: 'co-training-data-documentation',
			name: 'Training Data Documentation',
			description:
				'Verify training data summary and data governance documentation per C.R.S. 6-1-1702(2)(b)(I) and 6-1-1702(2)(c)(II)',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['training_data_summary', 'data_governance_measures'],
			},
		},
		{
			id: 'co-model-documentation',
			name: 'Model Purpose and Limitations Documentation',
			description:
				'Verify required model documentation per C.R.S. 6-1-1702(2)(b)(II)-(IV) and 6-1-1702(2)(c)(III)-(V)',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['system_purpose', 'known_limitations', 'intended_uses'],
			},
		},
		{
			id: 'co-impact-assessment-logging',
			name: 'Impact Assessment Audit Trail',
			description:
				'Ensure complete audit records for deployer impact assessments per C.R.S. 6-1-1703(3)(b)(I)-(VII). Records retained 3 years per 6-1-1703(3)(d).',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'use_case',
					'input_data_categories',
					'output_data_categories',
					'performance_metrics',
					'timestamp',
					'model',
					'governance_policy',
				],
			},
		},
		{
			id: 'co-consumer-pre-notification',
			name: 'Pre-Decision Consumer Notification',
			description: 'Verify pre-decision consumer notification status per C.R.S. 6-1-1703(4)(a)',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['consumer_notification_status', 'notification_timestamp'],
			},
		},
		{
			id: 'co-adverse-decision-disclosure',
			name: 'Adverse Decision Disclosure',
			description:
				'Verify adverse decisions include principal reasons, AI contribution degree, data types, and sources per C.R.S. 6-1-1703(4)(b)',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'contains',
				field: 'output',
				values: ['reason', 'decision', 'data', 'source'],
			},
		},
		{
			id: 'co-pii-detection',
			name: 'Personal Data Detection in Consequential Decisions',
			description:
				'Detect PII in inputs/outputs per C.R.S. 6-1-1703(3)(b)(III)-(IV) and 6-1-1703(4)(b)-(c)',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'co-human-oversight-metadata',
			name: 'Human Oversight and Appeal Capability',
			description:
				'Verify human review availability for appeals per C.R.S. 6-1-1703(4)(b) and monitoring per 6-1-1702(2)(c)(V)',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['human_oversight_available', 'appeal_mechanism'],
			},
		},
		{
			id: 'co-risk-management-framework',
			name: 'Risk Management Framework Alignment',
			description:
				'Verify NIST AI RMF or ISO 42001 framework alignment per C.R.S. 6-1-1703(2)(a) and affirmative defense per 6-1-1706',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'contains',
				field: 'risk_management_framework',
				values: ['NIST AI RMF', 'NIST AI 100-1', 'ISO 42001', 'ISO/IEC 42001'],
			},
		},
		{
			id: 'co-incident-reporting-flag',
			name: 'Discrimination Incident Detection Flag',
			description:
				'Flag potential algorithmic discrimination incidents triggering the 90-day AG notification per C.R.S. 6-1-1702(4) and 6-1-1703(6)',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'regex',
				field: 'output',
				pattern:
					'(?i)(denied|rejected|ineligible|disqualified|not\\s+approved|adverse).{0,100}(based\\s+on|due\\s+to|because\\s+of).{0,50}(age|race|gender|sex|disabilit|ethnic|religion|national\\s+origin|veteran|genetic|english|reproductive)',
			},
		},
		{
			id: 'co-content-safety',
			name: 'Content Safety Baseline for Consequential Decisions',
			description:
				'Enforce heightened content safety for consequential decision outputs per reasonable care duty in C.R.S. 6-1-1703(1)',
			phase: 'post',
			severity: 'medium',
			evaluate: {
				type: 'toxicity_threshold',
				max_score: 0.3,
			},
		},
	],
	scoring: {
		dimensions: [
			{
				name: 'algorithmic_fairness',
				rules: ['co-bias-detection', 'co-incident-reporting-flag', 'co-content-safety'],
			},
			{
				name: 'transparency',
				rules: [
					'co-consumer-pre-notification',
					'co-adverse-decision-disclosure',
					'co-consequential-decision-detection',
				],
			},
			{
				name: 'documentation',
				rules: [
					'co-training-data-documentation',
					'co-model-documentation',
					'co-impact-assessment-logging',
				],
			},
			{
				name: 'governance',
				rules: ['co-risk-management-framework', 'co-human-oversight-metadata', 'co-pii-detection'],
			},
		],
		threshold: 0.75,
		weights: {
			algorithmic_fairness: 0.35,
			transparency: 0.25,
			documentation: 0.25,
			governance: 0.15,
		},
	},
	metadata: {
		regulation: 'Colorado AI Act (SB 24-205)',
		statute: 'C.R.S. Title 6, Article 1, Part 17',
		jurisdiction: 'US-CO',
		effective_date: '2026-06-30',
		enforcement: 'Colorado Attorney General (exclusive)',
		penalty_max: '$20,000 per violation',
		cure_period_days: 60,
		affirmative_defense: 'NIST AI RMF or ISO/IEC 42001 compliance',
	},
};
