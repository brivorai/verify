/**
 * Minimal Governance Pack
 *
 * A lightweight pack for testing and getting started.
 * Only enforces basic logging and model identification.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const minimal: GovernancePack = {
	name: 'minimal',
	version: '1.0.0',
	description: 'Minimal governance pack for testing and getting started',
	rules: [
		{
			id: 'basic-logging',
			name: 'Basic event logging',
			description: 'Ensure prompt and model are recorded',
			phase: 'pre',
			severity: 'high',
			evaluate: { type: 'required', fields: ['prompt', 'model'] },
		},
		{
			id: 'basic-response',
			name: 'Response capture',
			description: 'Ensure response is captured',
			phase: 'post',
			severity: 'high',
			evaluate: { type: 'required', fields: ['response'] },
		},
	],
	scoring: {
		dimensions: [
			{
				name: 'completeness',
				rules: ['basic-logging', 'basic-response'],
			},
		],
		threshold: 0.5,
		weights: { completeness: 1.0 },
	},
	metadata: {},
};
