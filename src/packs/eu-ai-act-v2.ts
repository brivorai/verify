/**
 * EU AI Act v2 Governance Pack
 *
 * Comprehensive compliance pack for Regulation (EU) 2024/1689 covering
 * high-risk AI systems (Art. 6-15), transparency obligations (Art. 50),
 * prohibited practices (Art. 5), post-market monitoring (Art. 72), and
 * incident reporting (Art. 73). Replaces eu-ai-act-v1.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const euAiActV2: GovernancePack = {
	name: 'eu-ai-act-v2',
	version: '2.0.0',
	description:
		'EU AI Act (Regulation (EU) 2024/1689) comprehensive governance pack for high-risk AI systems. Covers Art. 5 (prohibited practices), Art. 9 (risk management), Art. 10 (data governance), Art. 11 (technical documentation), Art. 12 (record-keeping), Art. 13 (transparency), Art. 14 (human oversight), Art. 15 (accuracy/robustness/cybersecurity), Art. 50 (transparency for all AI), Art. 72 (post-market monitoring), and Art. 73 (incident reporting). Replaces eu-ai-act-v1.',
	rules: [
		// ── SECTION A: PROHIBITED PRACTICES GATE (Art. 5) ───────────
		{
			id: 'prohibited-practice-screening',
			name: 'Prohibited AI Practice Screening',
			description:
				'Screens intended use against the 8 categories of prohibited AI practices under Art. 5: subliminal manipulation, vulnerability exploitation, social scoring, predictive policing via profiling, untargeted facial scraping, workplace emotion recognition, sensitive biometric categorization, real-time remote biometric ID.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'custom',
				fn: 'prohibited_use_classifier',
			},
		},

		// ── SECTION B: RISK MANAGEMENT SYSTEM (Art. 9) ──────────────
		{
			id: 'risk-management-documentation',
			name: 'Risk Management System Documentation',
			description:
				'Verifies documented risk management system exists covering risk identification, intended use risks, foreseeable misuse risks, risk management measures, and lifecycle monitoring plan per Art. 9(1)-(2).',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'risk_identification',
					'intended_use_risks',
					'foreseeable_misuse_risks',
					'risk_management_measures',
					'lifecycle_monitoring_plan',
				],
			},
		},
		{
			id: 'risk-testing-metrics',
			name: 'Risk Testing Against Defined Metrics',
			description:
				'Verifies testing against prior defined metrics and probabilistic thresholds appropriate to intended purpose per Art. 9(6) and 9(8). Test results must be documented with dated logs.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'test_date',
					'metrics_defined',
					'thresholds_defined',
					'results_vs_thresholds',
					'responsible_person_signature',
				],
			},
		},
		{
			id: 'residual-risk-assessment',
			name: 'Residual Risk Acceptability Assessment',
			description:
				'Verifies residual risk (per hazard and overall) assessed and judged acceptable after risk management measures per Art. 9(4)-(5). Includes combined effects analysis.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'residual_risk_per_hazard',
					'overall_residual_risk',
					'combined_effects_analysis',
					'acceptability_judgment',
				],
			},
		},

		// ── SECTION C: DATA AND DATA GOVERNANCE (Art. 10) ───────────
		{
			id: 'data-governance-documentation',
			name: 'Data Governance and Management Practices',
			description:
				'Verifies data governance practices covering data provenance, collection processes, preparation operations, assumptions, availability assessment, and bias examination per Art. 10(1)-(2).',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'data_provenance',
					'data_collection_processes',
					'data_preparation_operations',
					'data_assumptions',
					'data_availability_assessment',
					'bias_examination',
					'bias_mitigation_measures',
				],
			},
		},
		{
			id: 'data-quality-assessment',
			name: 'Data Quality and Representativeness',
			description:
				'Verifies training, validation, and testing data sets are relevant, representative, error-free, and complete per Art. 10(3)-(4). Includes geographic/contextual appropriateness.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'relevance_documented',
					'representativeness_documented',
					'error_rate_assessed',
					'completeness_assessed',
					'statistical_properties_documented',
				],
			},
		},
		{
			id: 'bias-detection-mitigation',
			name: 'Bias Detection and Mitigation',
			description:
				'Verifies bias examination on data sets per Art. 10(2)(f)-(g) with measures to detect, prevent, and mitigate biases affecting health/safety, fundamental rights, or leading to discrimination.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'bias_detection',
				protected_attributes: [
					'race',
					'gender',
					'age',
					'disability',
					'religion',
					'national_origin',
					'sexual_orientation',
				],
			},
		},

		// ── SECTION D: TECHNICAL DOCUMENTATION (Art. 11 + Annex IV) ─
		{
			id: 'technical-documentation-completeness',
			name: 'Technical Documentation Completeness (Annex IV)',
			description:
				'Verifies technical documentation contains all Annex IV elements: general description, intended purpose, provider identity, development details, algorithm description, capabilities/limitations, validation/testing, risk management, change history, and post-market monitoring plan per Art. 11(1).',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'general_description',
					'intended_purpose',
					'provider_identity',
					'version_info',
					'algorithm_description',
					'capabilities_limitations',
					'validation_testing',
					'risk_management_description',
					'change_history',
					'post_market_monitoring_plan',
				],
			},
		},

		// ── SECTION E: RECORD-KEEPING (Art. 12) ─────────────────────
		{
			id: 'automatic-event-logging',
			name: 'Automatic Event Logging Capability',
			description:
				'Verifies automatic recording of events over AI system lifetime per Art. 12(1)-(2). Logs must enable risk event identification, post-market monitoring, and operation monitoring.',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'request_id',
					'timestamp',
					'model',
					'prompt',
					'response',
					'evaluation_result',
					'fidelity_score',
				],
			},
		},
		{
			id: 'log-retention-compliance',
			name: 'Log Retention Period Compliance',
			description:
				'Verifies logs are retained for at least 6 months per Art. 19. Deployers must also retain logs per Art. 26(6).',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['log_retention_days', 'deployer_retention_confirmed'],
			},
		},
		{
			id: 'log-tamper-evidence',
			name: 'Log Tamper-Evidence and Integrity',
			description:
				'Verifies event logs have tamper-evident properties per Art. 12 combined with Art. 15(5) cybersecurity requirements. Supports cryptographic hash chains, digital signatures, or append-only storage.',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['tamper_evidence_method', 'integrity_verified'],
			},
		},

		// ── SECTION F: TRANSPARENCY (Art. 13) ───────────────────────
		{
			id: 'system-identification',
			name: 'System Identification and Provider Information',
			description:
				'Verifies provider identity, contact details, system name/version, and intended purpose per Art. 13(3)(a).',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'provider_name',
					'provider_contact',
					'system_name',
					'system_version',
					'intended_purpose',
				],
			},
		},
		{
			id: 'performance-declaration',
			name: 'Accuracy and Performance Metrics Declaration',
			description:
				'Verifies accuracy metrics, robustness levels, and cybersecurity levels are declared per Art. 15(3) and Art. 13(3)(b). Performance specified for relevant groups per Art. 13(3)(b)(iv).',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'accuracy_metrics',
					'accuracy_levels',
					'robustness_level',
					'cybersecurity_level',
					'performance_per_group',
				],
			},
		},
		{
			id: 'limitations-and-risks-disclosure',
			name: 'Known Limitations and Foreseeable Risks Disclosure',
			description:
				'Verifies documentation of known risks, input data specifications, output interpretation guidance, and maintenance measures per Art. 13(3)(b)(iii), (v), (vi), (g).',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'known_risks_and_circumstances',
					'input_data_specifications',
					'output_interpretation_guidance',
					'maintenance_measures',
				],
			},
		},

		// ── SECTION G: HUMAN OVERSIGHT (Art. 14) ────────────────────
		{
			id: 'human-oversight-mechanism',
			name: 'Human Oversight Mechanism',
			description:
				'Verifies effective human oversight per Art. 14(1)-(4): anomaly monitoring, automation bias awareness, output interpretation, override capability, and halt mechanism.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'anomaly_monitoring',
					'automation_bias_awareness',
					'output_interpretation',
					'override_capability',
					'halt_mechanism',
				],
			},
		},
		{
			id: 'human-oversight-assignment',
			name: 'Human Oversight Personnel Assignment',
			description:
				'Verifies human oversight assigned to persons with necessary competence, training, and authority per Art. 26(2). For biometric systems, dual-human verification per Art. 14(5).',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'oversight_personnel_identified',
					'competence_verified',
					'training_documented',
					'authority_level_defined',
				],
			},
		},

		// ── SECTION H: ACCURACY, ROBUSTNESS, CYBERSECURITY (Art. 15) ─
		{
			id: 'robustness-and-resilience',
			name: 'Robustness and Error Resilience',
			description:
				'Verifies system resilience to errors, faults, and inconsistencies per Art. 15(4). For learning systems, verifies feedback loop mitigation.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'error_resilience_documented',
					'fault_tolerance_measures',
					'feedback_loop_mitigation',
				],
			},
		},
		{
			id: 'cybersecurity-ai-specific',
			name: 'AI-Specific Cybersecurity Measures',
			description:
				'Verifies defenses against AI-specific vulnerabilities per Art. 15(5): data poisoning, model poisoning, adversarial examples/model evasion, confidentiality attacks, and model flaws.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'data_poisoning_prevention',
					'model_poisoning_prevention',
					'adversarial_example_detection',
					'confidentiality_attack_prevention',
				],
			},
		},

		// ── SECTION I: TRANSPARENCY FOR ALL AI (Art. 50) ────────────
		{
			id: 'ai-interaction-disclosure',
			name: 'AI Interaction Disclosure (Chatbots)',
			description:
				'For AI systems interacting with natural persons: verifies individuals are informed they are interacting with AI per Art. 50(1), unless obvious from context.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['ai_disclosure_present'],
			},
		},
		{
			id: 'synthetic-content-marking',
			name: 'Synthetic Content Machine-Readable Marking',
			description:
				'For AI systems generating synthetic content: verifies outputs are marked in machine-readable format and detectable as AI-generated per Art. 50(2). Solutions must be effective, interoperable, robust, and reliable.',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['content_marking_method', 'machine_readable_marking'],
			},
		},

		// ── SECTION J: POST-MARKET MONITORING & INCIDENTS (Art. 72-73)
		{
			id: 'post-market-monitoring',
			name: 'Post-Market Monitoring System',
			description:
				'Verifies post-market monitoring system exists that actively collects, documents, and analyses performance data throughout AI system lifetime per Art. 72(1)-(3).',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'monitoring_system_description',
					'data_collection_methods',
					'analysis_procedures',
					'compliance_evaluation_process',
				],
			},
		},
		{
			id: 'incident-reporting-mechanism',
			name: 'Serious Incident Reporting Mechanism',
			description:
				'Verifies incident reporting mechanism exists with timeframes per Art. 73: 2 days for widespread infringement, 10 days for death, 15 days for other serious incidents.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'incident_classification_system',
					'authority_notification_process',
					'initial_report_capability',
				],
			},
		},
	],
	scoring: {
		dimensions: [
			{
				name: 'risk_management',
				rules: [
					'risk-management-documentation',
					'risk-testing-metrics',
					'residual-risk-assessment',
					'post-market-monitoring',
					'incident-reporting-mechanism',
				],
			},
			{
				name: 'data_governance',
				rules: [
					'data-governance-documentation',
					'data-quality-assessment',
					'bias-detection-mitigation',
				],
			},
			{
				name: 'documentation',
				rules: ['technical-documentation-completeness'],
			},
			{
				name: 'traceability',
				rules: [
					'automatic-event-logging',
					'log-retention-compliance',
					'log-tamper-evidence',
					'post-market-monitoring',
				],
			},
			{
				name: 'transparency',
				rules: [
					'system-identification',
					'performance-declaration',
					'limitations-and-risks-disclosure',
					'ai-interaction-disclosure',
					'synthetic-content-marking',
				],
			},
			{
				name: 'human_oversight',
				rules: ['human-oversight-mechanism', 'human-oversight-assignment'],
			},
			{
				name: 'robustness',
				rules: ['risk-testing-metrics', 'performance-declaration', 'robustness-and-resilience'],
			},
			{
				name: 'cybersecurity',
				rules: ['cybersecurity-ai-specific', 'log-tamper-evidence'],
			},
			{
				name: 'safety',
				rules: [
					'prohibited-practice-screening',
					'residual-risk-assessment',
					'incident-reporting-mechanism',
					'bias-detection-mitigation',
				],
			},
		],
		threshold: 0.8,
		weights: {
			risk_management: 0.2,
			data_governance: 0.12,
			documentation: 0.08,
			traceability: 0.15,
			transparency: 0.15,
			human_oversight: 0.1,
			robustness: 0.08,
			cybersecurity: 0.07,
			safety: 0.05,
		},
	},
	metadata: {
		regulation: 'Regulation (EU) 2024/1689 (EU AI Act)',
		jurisdiction: 'European Union (27 Member States + EEA)',
		scope:
			'High-Risk AI Systems (Annex III), General Transparency (Art. 50), All AI Systems (Art. 4)',
		enforcement_date: '2026-08-02',
		enforcement_date_note:
			'May be deferred to 2027-12-02 if Digital Omnibus adopted and harmonized standards unavailable',
		penalty_max: 'EUR 35,000,000 or 7% worldwide annual turnover',
		replaces: 'eu-ai-act-v1',
		articles_covered: [
			'Art. 5',
			'Art. 9',
			'Art. 10',
			'Art. 11',
			'Art. 12',
			'Art. 13',
			'Art. 14',
			'Art. 15',
			'Art. 50',
			'Art. 72',
			'Art. 73',
		],
		last_updated: '2026-02-18',
	},
};
