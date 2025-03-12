// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import chalk from 'chalk';
import { access, constants, copyFile } from 'fs/promises';
import { join } from 'path';
import { exit } from 'process';

const { red, yellow, blue } = chalk;

/**
 * To test IoTest we need an implementation of Io. Unfortunately, we can't
 * directly import IoMem from @rljson/io-mem/src/io-mem.ts because it would
 * create a circular dependency. So we copy the implementation here.
 */

class CopyIoMem {
  constructor() {}

  static run = async () => {
    const instance = new CopyIoMem();
    await instance._run();
  };

  // ######################
  // Private
  // ######################

  private _src = join(
    __dirname,
    '..',
    '..',
    '..',
    'io-mem',
    'src',
    'io-mem.ts',
  );

  private _run = async () => {
    await this._checkIfCheckedOut();
    await this._copyIoMem();
  };

  private _checkIfCheckedOut = async () => {
    try {
      await access(this._src, constants.F_OK);
    } catch {
      throw new Error(
        [
          red('Did not find »../io-mem«'),
          yellow('  Please execute:'),
          blue('    cd ..'),
          blue('    git clone https://github.com/rljson/io-mem.git'),
        ].join('\n'),
      );
    }
  };

  _copyIoMem = async () => {
    const target = join(__dirname, 'io-mem.ts');
    await copyFile(this._src, target);
    console.log(
      chalk.green(
        [
          yellow('Copied '),
          blue('  ../io-mem/src/io-mem.ts'),
          yellow('to'),
          blue('  ./test/setup/io-mem.ts'),
        ].join('\n'),
      ),
    );
  };
}
// .............................................................................
CopyIoMem.run()
  .catch((err) => {
    console.log((err as Error).message);
    exit(1);
  })
  .then(() => {
    process.exit(0);
  });
