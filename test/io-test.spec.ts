// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { IoTest } from '../src/io-test';

import { IoMem } from './setup/io-mem.ts';

describe('io-test', async () => {
  const factory = () => IoMem.example();
  IoTest.run(factory);
  it('should run tests', () => {});
});
