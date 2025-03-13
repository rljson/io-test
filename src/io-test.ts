// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Io } from '@rljson/io';
import { TableType } from '@rljson/rljson';

import { afterAll, beforeEach, describe, expect, it } from 'vitest';

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

  private _run() {
    return describe('IoTests', () => {
      let io: Io;

      beforeEach(async () => {
        io = this.newIo();
        await io.isReady();
      });

      afterAll(async () => {});

      describe('createTable(request)', () => {
        it('should add a table', async () => {
          await io.createTable({ name: 'table1', type: 'properties' });
          let tables = await io.tables();
          expect(tables).toEqual(['table1']);

          await io.createTable({ name: 'table2', type: 'cake' });
          tables = await io.tables();
          expect(tables).toEqual(['table1', 'table2']);
        });

        describe('createTable', async () => {
          describe('throws', async () => {
            it('if the table already exists with a different type', async () => {
              await io.createTable({ name: 'table', type: 'properties' });
              await expect(
                io.createTable({ name: 'table', type: 'buffet' }),
              ).rejects.toThrow();
            });
          });

          describe('does nothing', async () => {
            it('if the table already exists with the same type', async () => {
              await io.createTable({ name: 'table', type: 'properties' });
              expect(await io.tables()).toEqual(['table']);
              await io.createTable({ name: 'table', type: 'properties' });
              expect(await io.tables()).toEqual(['table']);
            });
          });
        });
      });

      describe('write(request)', async () => {
        it('throws, when a table');

        it('adds a new table when not existing', async () => {
          await io.createTable({ name: 'tableA', type: 'properties' });

          await io.write({
            data: {
              tableA: {
                _type: 'properties',
                _data: [{ keyA2: 'a2' }],
              },
            },
          });

          const dump = await io.dump();
          const items = (dump.tableA as TableType)._data;
          expect(items).toEqual([
            { keyA2: 'a2', _hash: 'apLP3I2XLnVm13umIZdVhV' },
          ]);
        });

        it('adds data to existing data', async () => {
          await io.createTable({ name: 'tableA', type: 'properties' });

          // Write a first item
          await io.write({
            data: {
              tableA: {
                _type: 'properties',
                _data: [{ keyA2: 'a2' }],
              },
            },
          });

          const dump = await io.dump();
          const items = (dump.tableA as TableType)._data;
          expect(items).toEqual([
            { keyA2: 'a2', _hash: 'apLP3I2XLnVm13umIZdVhV' },
          ]);

          // Write a second item
          await io.write({
            data: {
              tableA: {
                _type: 'properties',
                _data: [{ keyB2: 'b2' }],
              },
            },
          });

          const dump2 = await io.dump();
          const items2 = (dump2.tableA as TableType)._data;
          expect(items2).toEqual([
            { keyA2: 'a2', _hash: 'apLP3I2XLnVm13umIZdVhV' },
            { keyB2: 'b2', _hash: 'oNNJMCE_2iycGPDyM_5_lp' },
          ]);
        });

        describe('throws', () => {
          it('when the table has a different type then an existing one', async () => {
            await io.createTable({ name: 'tableA', type: 'properties' });

            await io.write({
              data: {
                tableA: {
                  _type: 'properties',
                  _data: [{ keyA2: 'a2' }],
                },
              },
            });

            let message: string = '';

            try {
              await io.write({
                data: {
                  tableA: {
                    _type: 'cake',
                    _data: [
                      {
                        keyB2: 'b2',
                        itemIds: 'xyz',
                        itemIdsTable: 'xyz',
                        itemIds2: 'xyz',
                        layersTable: 'xyz',
                        layers: {},
                      },
                    ],
                  },
                },
                /* v8 ignore next */
              });
            } catch (err: any) {
              message = err.message;
            }

            expect(message).toBe(
              'Table tableA has different types: "properties" vs "cake"',
            );
          });
        });
      });

      describe('readRow(request)', () => {
        describe('throws', () => {
          it('when the table does not exist', async () => {
            let message: string = '';

            try {
              await io.readRow({
                table: 'tableA',
                rowHash: 'xyz',
                /* v8 ignore next */
              });
            } catch (err: any) {
              message = err.message;
            }

            expect(message).toBe('Table tableA not found');
          });
        });

        describe('returns Rljson containing the table with the one row', () => {
          it('when the data exists', async () => {
            await io.createTable({ name: 'tableA', type: 'properties' });

            await io.write({
              data: {
                tableA: {
                  _type: 'properties',
                  _data: [{ keyA2: 'a2', keyA3: 'a3' }],
                },
              },
            });

            const dump = await io.dump();
            const hash = (dump.tableA as any)._data[0]._hash;

            const data = await io.readRow({
              table: 'tableA',
              rowHash: hash,
            });

            expect(data).toEqual({
              tableA: {
                _data: [
                  {
                    _hash: hash,
                    keyA2: 'a2',
                    keyA3: 'a3',
                  },
                ],
              },
            });
          });

          it('throws when the row does not exist', async () => {
            await io.createTable({ name: 'tableA', type: 'properties' });

            await io.write({
              data: {
                tableA: {
                  _type: 'properties',
                  _data: [{ keyA2: 'a2', keyA3: 'a3' }],
                },
              },
            });

            let message: string = '';

            try {
              await io.readRow({
                table: 'tableA',
                rowHash: 'xyz',
                /* v8 ignore next */
              });
            } catch (err: any) {
              message = err.message;
            }

            expect(message).toBe('Row "xyz" not found in table tableA');
          });
        });
      });
    });
  }
}
