/**
 * Singapore AI Governance Framework Governance Pack
 *
 * Enforces principles from IMDA/PDPC Model AI Governance Framework
 * (2nd Edition, January 2020) and Model AI Governance Framework for
 * Generative AI (May 2024). Covers internal governance, algorithm
 * transparency, human oversight, data governance, and accountability.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const singaporeAiGovernance: GovernancePack = {
	name: 'singapore-ai-governance',
	version: '1.0.0',
	description:
		'Singapore AI Governance Framework compliance pack. Enforces IMDA/PDPC Model AI Governance Framework (2nd Edition) and Generative AI Framework (May 2024): internal governance structures, algorithm transparency and explainability, human oversight, data governance, accountability mechanisms, and AI Verify testing alignment.',
	rules: [
		{
			id: 'sg-ai-internal-governance',
			name: 'Internal Governance Structure',
			description:
				'Verify internal governance structures for AI per Model Framework Section 2. Organizations should have clear roles, responsibilities, and risk management processes.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['governance_structure_defined', 'ai_roles_assigned', 'risk_management_process'],
			},
		},
		{
			id: 'sg-ai-risk-assessment',
			name: 'AI Risk Assessment',
			description:
				'Verify risk assessment process considering probability and severity of harm per Model Framework. Risk determines the level of human oversight required.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'risk_assessment_completed',
					'harm_probability_evaluated',
					'harm_severity_evaluated',
				],
			},
		},
		{
			id: 'sg-ai-explainability',
			name: 'Algorithm Transparency and Explainability',
			description:
				'Verify AI decisions are explainable and transparent per Model Framework Section 3. Explanations should be proportionate to the risk level.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['explainability_approach', 'decision_factors_documented'],
			},
		},
		{
			id: 'sg-ai-human-oversight',
			name: 'Human Oversight',
			description:
				'Verify appropriate human oversight mechanisms proportionate to risk level per Model Framework. Higher risk requires human-in-the-loop; lower risk allows human-over-the-loop.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['human_oversight_level', 'oversight_mechanism'],
			},
		},
		{
			id: 'sg-ai-data-governance',
			name: 'Data Governance',
			description:
				'Verify data governance practices for AI systems including data quality, lineage, and PDPA compliance per Model Framework data management principles',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['data_quality_measures', 'data_lineage_documented', 'pdpa_compliance'],
			},
		},
		{
			id: 'sg-ai-accountability',
			name: 'Accountability and Documentation',
			description:
				'Verify accountability mechanisms including system documentation, performance tracking, and stakeholder communication per Model Framework',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['system_documentation', 'performance_tracking', 'stakeholder_communication'],
			},
		},
		{
			id: 'sg-ai-genai-disclosure',
			name: 'Generative AI Content Disclosure',
			description:
				'Verify AI-generated content is disclosed to users per Generative AI Framework (May 2024) transparency dimension',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['ai_content_disclosure', 'genai_use_disclosed'],
			},
		},
		{
			id: 'sg-ai-incident-management',
			name: 'AI Incident Management',
			description:
				'Verify incident management processes for AI system failures, errors, or harmful outputs per Model Framework operational governance',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['incident_response_plan', 'escalation_procedures'],
			},
		},
		{
			id: 'sg-ai-bias-detection',
			name: 'Fairness and Bias Detection',
			description:
				'Monitor AI outputs for bias and fairness per Model Framework fairness principles. AI systems should not discriminate unfairly.',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'bias_detection',
				protected_attributes: ['race', 'sex', 'age', 'religion', 'nationality'],
			},
		},
		{
			id: 'sg-ai-content-safety',
			name: 'Content Safety Screening',
			description:
				'Screen AI outputs for harmful content per Generative AI Framework safety and alignment dimension',
			phase: 'post',
			severity: 'medium',
			evaluate: {
				type: 'toxicity_threshold',
				max_score: 0.7,
			},
		},
		{
			id: 'sg-ai-pii-protection',
			name: 'Personal Data Protection',
			description:
				'Detect PII in AI inputs to support compliance with PDPA and Model Framework data governance principles',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'sg-ai-audit-trail',
			name: 'Governance Audit Trail',
			description:
				'Maintain audit records for AI operations to support accountability and AI Verify testing requirements',
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
				name: 'governance_structure',
				rules: ['sg-ai-internal-governance', 'sg-ai-risk-assessment', 'sg-ai-accountability'],
			},
			{
				name: 'transparency_explainability',
				rules: ['sg-ai-explainability', 'sg-ai-genai-disclosure'],
			},
			{
				name: 'safety_fairness',
				rules: [
					'sg-ai-human-oversight',
					'sg-ai-bias-detection',
					'sg-ai-content-safety',
					'sg-ai-incident-management',
				],
			},
			{
				name: 'data_protection',
				rules: ['sg-ai-data-governance', 'sg-ai-pii-protection', 'sg-ai-audit-trail'],
			},
		],
		threshold: 0.75,
		weights: {
			governance_structure: 0.3,
			transparency_explainability: 0.2,
			safety_fairness: 0.3,
			data_protection: 0.2,
		},
	},
	metadata: {
		regulation: 'Model AI Governance Framework (2nd Edition) & GenAI Framework',
		framework: 'IMDA/PDPC Model AI Governance Framework',
		jurisdiction: 'SG',
		effective_date: '2020-01-21',
		genai_framework_date: '2024-05-30',
		status: 'voluntary',
		publisher: 'IMDA (Infocomm Media Development Authority) / PDPC',
		testing_framework: 'AI Verify (open-source AI governance testing)',
		scope: 'Organizations deploying AI systems in Singapore',
		pdpa_alignment: 'Personal Data Protection Act 2012',
	},
};
