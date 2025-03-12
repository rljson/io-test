// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Io } from '@rljson/io';

// import { afterAll, beforeEach, describe, expect, it } from 'vitest';

/**
 * Takes a Io factory function and runs tests on it
 *
 * See io-test.spec.ts for an example
 */
export class IoTest {
  /**
   * Constructor
   * @param newIo - A function that returns a new clean Io instance
   */
  constructor(public readonly newIo: () => Io) {}

  /**
   * Execute the tests
   * @param ioFactory - A function that returns a new clean Io instance
   * @returns a promise that resolves when all tests are done
   */
  static run = (ioFactory: () => Io) => {
    const test = new IoTest(ioFactory);
    return test._run();
  };

  // ######################
  // Private
  // ######################

  private _run() {}
}
