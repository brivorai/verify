/**
 * Japan AI Governance Pack
 *
 * Enforces Japan's AI Guidelines for Business (Version 1.1, March
 * 2025, METI/MIC) and the AI Promotion Act (enacted May 28, 2025,
 * effective September 1, 2025). Guidelines are non-binding soft law;
 * the Act establishes AI Strategy Headquarters and basic measures but
 * contains no penalties. Based on human-centric AI social principles.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const japanAiGovernance: GovernancePack = {
	name: 'japan-ai-governance',
	version: '1.0.0',
	description:
		'Japan AI governance compliance pack. Enforces AI Guidelines for Business v1.1 (METI/MIC, March 2025) and AI Promotion Act (May 2025): human-centric AI principles (dignity, diversity, sustainability), transparency, safety, fairness, privacy, accountability, and responsible AI lifecycle management across development, provision, and use.',
	rules: [
		{
			id: 'jp-ai-human-centric-principles',
			name: 'Human-Centric AI Principles',
			description:
				'Verify alignment with Japan Social Principles of Human-Centric AI: dignity, diversity and inclusion, and sustainability per AI Guidelines for Business v1.1',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['human_centric_principles_documented', 'dignity_considerations'],
			},
		},
		{
			id: 'jp-ai-transparency',
			name: 'AI Transparency and Explainability',
			description:
				'Verify transparency in AI operations per AI Guidelines. Must provide explanations proportionate to the context and potential impact of AI use.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['transparency_measures', 'explainability_approach', 'ai_use_disclosed'],
			},
		},
		{
			id: 'jp-ai-safety-security',
			name: 'AI Safety and Security',
			description:
				'Verify safety and security measures for AI systems per AI Guidelines. Must address risks to life, health, and property.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['safety_measures_documented', 'security_controls', 'risk_assessment'],
			},
		},
		{
			id: 'jp-ai-fairness',
			name: 'AI Fairness',
			description:
				'Verify fairness measures to prevent unjust discrimination per AI Guidelines. AI should not create or reinforce unfair bias.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['fairness_measures_documented', 'bias_assessment_conducted'],
			},
		},
		{
			id: 'jp-ai-privacy-protection',
			name: 'Privacy Protection',
			description:
				'Verify privacy protections for personal information used in AI systems per AI Guidelines and APPI (Act on Protection of Personal Information)',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['privacy_protections_documented', 'appi_compliance'],
			},
		},
		{
			id: 'jp-ai-accountability',
			name: 'AI Accountability',
			description:
				'Verify accountability mechanisms per AI Guidelines. Organizations must have clear responsibility assignment and stakeholder communication.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['accountability_framework', 'responsibility_assignment'],
			},
		},
		{
			id: 'jp-ai-lifecycle-governance',
			name: 'AI Lifecycle Governance',
			description:
				'Verify governance across the AI lifecycle (development, provision, use) per AI Guidelines. Each stage has specific responsibilities.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['lifecycle_stage_identified', 'stage_responsibilities_defined'],
			},
		},
		{
			id: 'jp-ai-bias-monitoring',
			name: 'Bias and Fairness Monitoring',
			description:
				'Monitor AI outputs for bias per AI Guidelines fairness principles. Ongoing monitoring is expected throughout the AI lifecycle.',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'bias_detection',
				protected_attributes: ['race', 'sex', 'age', 'disability', 'nationality'],
			},
		},
		{
			id: 'jp-ai-content-safety',
			name: 'Content Safety Screening',
			description:
				'Screen AI outputs for harmful content per AI Guidelines safety and security principles',
			phase: 'post',
			severity: 'medium',
			evaluate: {
				type: 'toxicity_threshold',
				max_score: 0.7,
			},
		},
		{
			id: 'jp-ai-pii-detection',
			name: 'Personal Information Detection',
			description:
				'Detect personal information in AI inputs per APPI compliance and AI Guidelines privacy principles',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'jp-ai-audit-trail',
			name: 'Governance Audit Trail',
			description:
				'Maintain audit records for AI operations per AI Guidelines accountability and transparency requirements',
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
				name: 'human_centric_values',
				rules: ['jp-ai-human-centric-principles', 'jp-ai-fairness', 'jp-ai-privacy-protection'],
			},
			{
				name: 'transparency_accountability',
				rules: ['jp-ai-transparency', 'jp-ai-accountability', 'jp-ai-lifecycle-governance'],
			},
			{
				name: 'safety',
				rules: ['jp-ai-safety-security', 'jp-ai-bias-monitoring', 'jp-ai-content-safety'],
			},
			{
				name: 'data_protection',
				rules: ['jp-ai-pii-detection', 'jp-ai-audit-trail'],
			},
		],
		threshold: 0.7,
		weights: {
			human_centric_values: 0.3,
			transparency_accountability: 0.3,
			safety: 0.25,
			data_protection: 0.15,
		},
	},
	metadata: {
		regulation: 'AI Guidelines for Business v1.1 & AI Promotion Act',
		guidelines: 'AI Guidelines for Business Version 1.1 (METI/MIC, March 28, 2025)',
		legislation:
			'Act on Promotion of R&D and Utilization of AI-Related Technologies (May 28, 2025)',
		jurisdiction: 'JP',
		effective_date: '2025-09-01',
		status: 'voluntary',
		publisher: 'METI (Ministry of Economy, Trade and Industry) / MIC',
		scope: 'Organizations developing, providing, or using AI systems in Japan',
		ai_strategy_headquarters: 'Established September 1, 2025',
		penalties: 'None — basic law with no regulatory penalties',
		international_alignment: 'Hiroshima AI Process, G7 AI Code of Conduct, OECD AI Principles',
		note: 'Guidelines are non-binding soft law. AI Promotion Act is a promotional basic law without penalties.',
	},
};
