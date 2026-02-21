/**
 * OECD AI Principles Governance Pack
 *
 * Enforces the OECD Recommendation on Artificial Intelligence
 * (adopted May 2019, revised May 3, 2024). Five principles for
 * responsible AI stewardship: inclusive growth, human-centred values,
 * transparency, robustness/safety, and accountability. Adopted by
 * 47+ countries. Underpins G20 AI Principles and many national laws.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const oecdAiPrinciples: GovernancePack = {
	name: 'oecd-ai-principles',
	version: '1.0.0',
	description:
		'OECD AI Principles compliance pack. Enforces the OECD Recommendation on AI (revised May 2024): inclusive growth and sustainable development (1.1), human-centred values and fairness (1.2), transparency and explainability (1.3), robustness, security and safety (1.4), and accountability (1.5). 2024 revision adds environmental sustainability, misinformation, bias, and enhanced risk management.',
	rules: [
		{
			id: 'oecd-ai-inclusive-growth',
			name: 'Inclusive Growth and Sustainable Development',
			description:
				'Verify AI system contributes to inclusive growth and sustainable development per Principle 1.1. 2024 revision adds environmental sustainability considerations.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['inclusive_growth_assessment', 'sustainability_considerations'],
			},
		},
		{
			id: 'oecd-ai-human-centred-values',
			name: 'Human-Centred Values and Fairness',
			description:
				'Verify AI system respects human rights, democratic values, diversity, and fairness per Principle 1.2. 2024 revision expands to address misinformation amplified by AI.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['human_rights_assessment', 'fairness_measures', 'democratic_values_respected'],
			},
		},
		{
			id: 'oecd-ai-transparency',
			name: 'Transparency and Explainability',
			description:
				'Verify AI system provides meaningful transparency and explainability per Principle 1.3. 2024 revision strengthens focus on enabling challenging (not just understanding) AI outcomes.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['transparency_provided', 'explainability_approach', 'ai_use_disclosed'],
			},
		},
		{
			id: 'oecd-ai-robustness-safety',
			name: 'Robustness, Security, and Safety',
			description:
				'Verify AI system robustness, security, and safety per Principle 1.4. 2024 revision adds information integrity provisions. Must trace, assess, and manage risks throughout lifecycle.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['robustness_measures', 'security_controls', 'safety_assessment'],
			},
		},
		{
			id: 'oecd-ai-accountability',
			name: 'Accountability',
			description:
				'Verify clear accountability for AI system outcomes per Principle 1.5. 2024 revision adds systematic risk management and responsible business conduct requirements.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'accountability_framework',
					'responsibility_assignment',
					'risk_management_process',
				],
			},
		},
		{
			id: 'oecd-ai-risk-management',
			name: 'Systematic Risk Management',
			description:
				'Verify systematic and ongoing risk management per Principle 1.5 (2024 revision). Must address harmful bias, human rights including safety, security, privacy, labour, and IP rights.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['risk_management_systematic', 'bias_risk_addressed', 'rights_risks_assessed'],
			},
		},
		{
			id: 'oecd-ai-lifecycle-governance',
			name: 'AI System Lifecycle Governance',
			description:
				'Verify governance across the AI system lifecycle per OECD framework. Applies to design, development, deployment, and operation stages.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['lifecycle_governance', 'stage_identified'],
			},
		},
		{
			id: 'oecd-ai-bias-detection',
			name: 'Bias Detection and Fairness',
			description:
				'Monitor AI outputs for harmful bias per Principle 1.2 (fairness) and Principle 1.5 (2024 risk management expansion)',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'bias_detection',
				protected_attributes: ['race', 'sex', 'age', 'disability', 'religion', 'national_origin'],
			},
		},
		{
			id: 'oecd-ai-content-safety',
			name: 'Content Safety and Information Integrity',
			description:
				'Screen AI outputs for harmful content and misinformation per Principle 1.4 (2024 revision adds information integrity)',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'toxicity_threshold',
				max_score: 0.7,
			},
		},
		{
			id: 'oecd-ai-pii-protection',
			name: 'Privacy and Personal Data Protection',
			description:
				'Detect PII in AI inputs per Principle 1.2 (human-centred values include privacy). Support privacy-by-design approaches.',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'oecd-ai-audit-trail',
			name: 'Accountability Audit Trail',
			description:
				'Maintain audit records per Principle 1.5 accountability requirements. Support traceability and challenge mechanisms.',
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
				name: 'values_fairness',
				rules: [
					'oecd-ai-human-centred-values',
					'oecd-ai-inclusive-growth',
					'oecd-ai-bias-detection',
				],
			},
			{
				name: 'transparency',
				rules: ['oecd-ai-transparency', 'oecd-ai-lifecycle-governance'],
			},
			{
				name: 'safety_robustness',
				rules: ['oecd-ai-robustness-safety', 'oecd-ai-content-safety'],
			},
			{
				name: 'accountability_governance',
				rules: [
					'oecd-ai-accountability',
					'oecd-ai-risk-management',
					'oecd-ai-pii-protection',
					'oecd-ai-audit-trail',
				],
			},
		],
		threshold: 0.7,
		weights: {
			values_fairness: 0.3,
			transparency: 0.2,
			safety_robustness: 0.25,
			accountability_governance: 0.25,
		},
	},
	metadata: {
		regulation: 'OECD Recommendation on Artificial Intelligence',
		adopted: 'May 22, 2019',
		revised: 'May 3, 2024',
		jurisdiction: 'International',
		effective_date: '2024-05-03',
		status: 'voluntary',
		publisher: 'Organisation for Economic Co-operation and Development (OECD)',
		adherents: '47+ countries including all OECD members, EU, and partner countries',
		scope: 'All AI actors across the AI system lifecycle',
		g20_alignment: 'G20 AI Principles (2019) directly based on OECD AI Principles',
		revision_changes:
			'2024: Added environmental sustainability, misinformation, enhanced bias and risk management, information integrity',
		note: 'Non-binding recommendation but underpins many national AI laws worldwide',
	},
};
