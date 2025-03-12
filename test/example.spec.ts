// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { example } from '../src/example';

import { checkGoldens } from './setup/goldens';

describe('example', () => {
  it('should run without error', async () => {
    // Run example
    const logMessages: string[] = [];
    console.log = (message: string) => logMessages.push(message);
    await example();

    // Check goldens
    await checkGoldens('test/goldens/example.log', logMessages.join('\n'));

    // Reset console
    console.log = console.log;
  });
});
