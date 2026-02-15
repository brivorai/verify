/**
 * EU AI Act v1 Governance Pack
 *
 * Maps to Article 12 requirements for tamper-evident logging
 * in high-risk AI systems.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const euAiActV1: GovernancePack = {
	name: 'eu-ai-act-v1',
	version: '1.0.0',
	description: 'EU AI Act Article 12 — Automatic recording of events for high-risk AI systems',
	rules: [
		{
			id: 'art-12-1-logging',
			name: 'Automatic event logging',
			description: 'All events must be automatically recorded (Art. 12(1))',
			phase: 'both',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['prompt', 'model', 'response', 'timestamp'],
			},
		},
		{
			id: 'art-12-2-traceability',
			name: 'Event traceability',
			description: 'Logs must enable tracing back to specific decisions (Art. 12(2))',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['model', 'parameters', 'response', 'timing'],
			},
		},
		{
			id: 'art-12-3-monitoring',
			name: 'Monitoring capability',
			description: 'System must support post-deployment monitoring (Art. 12(3))',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['fidelity_score', 'evaluation_result'],
			},
		},
		{
			id: 'art-14-human-oversight',
			name: 'Human oversight data',
			description: 'Sufficient information for human oversight (Art. 14)',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['prompt', 'response', 'governance_result'],
			},
		},
		{
			id: 'art-13-transparency',
			name: 'Transparency — model identification',
			description: 'AI system must be identifiable (Art. 13)',
			phase: 'pre',
			severity: 'high',
			evaluate: { type: 'required', fields: ['model'] },
		},
		{
			id: 'content-safety',
			name: 'Content safety baseline',
			description: 'Flag potentially harmful content in prompts',
			phase: 'pre',
			severity: 'medium',
			evaluate: { type: 'toxicity_threshold', max_score: 0.8 },
		},
		{
			id: 'pii-detection',
			name: 'PII detection in prompts',
			description: 'Detect personal data in AI inputs',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
	],
	scoring: {
		dimensions: [
			{
				name: 'transparency',
				rules: ['art-13-transparency', 'art-12-1-logging'],
			},
			{
				name: 'traceability',
				rules: ['art-12-2-traceability', 'art-12-3-monitoring'],
			},
			{
				name: 'safety',
				rules: ['content-safety', 'art-14-human-oversight'],
			},
			{ name: 'privacy', rules: ['pii-detection'] },
		],
		threshold: 0.7,
		weights: {
			transparency: 0.3,
			traceability: 0.3,
			safety: 0.25,
			privacy: 0.15,
		},
	},
	metadata: {
		regulation: 'EU AI Act',
		articles: ['12', '13', '14'],
		effective_date: '2026-08-02',
	},
};
