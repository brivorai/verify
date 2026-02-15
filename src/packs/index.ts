/**
 * Built-in governance pack registry.
 * @module
 */

import type { GovernancePack } from '../types.js';
import { euAiActV1 } from './eu-ai-act-v1.js';
import { minimal } from './minimal.js';

export const builtinPacks = new Map<string, GovernancePack>([
	['eu-ai-act-v1', euAiActV1],
	['minimal', minimal],
]);
