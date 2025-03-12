// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip, hsh } from '@rljson/hash';
import { Io } from '@rljson/io';
import { Hashed } from '@rljson/json';
import { ContentType, Rljson, TableType } from '@rljson/rljson';

/**
 * In-Memory implementation of the Rljson Io interface.
 */
export class IoMem implements Io {
  // ...........................................................................
  // Geeral
  isReady() {
    return Promise.resolve();
  }

  // ...........................................................................
  // Read and write data

  readRow(request: { table: string; rowHash: string }): Promise<Rljson> {
    return this._readRow(request);
  }

  write(request: { data: Rljson }): Promise<void> {
    return this._write(request);
  }

  // ...........................................................................
  // Table management
  createTable(request: { name: string; type: ContentType }): Promise<void> {
    return this._createTable(request);
  }

  async tables(): Promise<string[]> {
    const keys = Object.keys(this._data);
    const tables = keys.filter((key) => !key.startsWith('_'));
    return tables;
  }

  // ######################
  // Private
  // ######################

  // ...........................................................................
  private async _createTable(request: {
    name: string;
    type: ContentType;
  }): Promise<void> {
    const { name, type } = request;

    // Get the existing table
    const existing = this._data[name] as TableType;
    if (existing) {
      // Throw if the existing table has a different type
      if (existing._type !== type) {
        throw new Error(
          `Table ${name} already exists with different type: "${existing._type}" vs "${request.type}"`,
        );
      }
    }

    // No table exists yet. Create it.
    else {
      this._data[name] ??= {
        _data: [],
        _type: type,
      };
    }
  }

  // ...........................................................................
  private async _readRow(request: {
    table: string;
    rowHash: string;
  }): Promise<Rljson> {
    const table = this._data[request.table] as TableType;

    if (!table) {
      throw new Error(`Table ${request.table} not found`);
    }

    const row = table._data.find((row) => row._hash === request.rowHash);

    if (!row) {
      throw new Error(
        `Row "${request.rowHash}" not found in table ${request.table}`,
      );
    }

    const result: Rljson = {
      [request.table]: {
        _data: [row],
      },
    } as any;

    return result;
  }
  static example = () => {
    return new IoMem();
  };

  async dump(): Promise<Rljson> {
    return this._data;
  }

  // ...........................................................................
  private async _write(request: { data: Rljson }): Promise<void> {
    const addedData = hsh(request.data);
    const tables = Object.keys(addedData);

    for (const table of tables) {
      if (table.startsWith('_')) {
        continue;
      }

      const oldTable = this._data[table] as TableType;
      const newTable = addedData[table] as TableType;

      // Table does not exist yet. Insert all
      if (!oldTable) {
        this._data[table] = newTable;
        continue;
      }

      // Make sure oldTable and newTable have the same type
      if (oldTable._type !== newTable._type) {
        throw new Error(
          `Table ${table} has different types: "${oldTable._type}" vs "${newTable._type}"`,
        );
      }

      // Table exists. Merge data
      for (const item of newTable._data) {
        const hash = item._hash;
        const exists = oldTable._data.find((i) => i._hash === hash);
        if (!exists) {
          oldTable._data.push(item as any);
        }
      }
    }

    // Recalc main hashes
    this._data._hash = '';
    const updateExistingHashes = false;
    const throwIfOnWrongHashes = false;
    hip(this._data, updateExistingHashes, throwIfOnWrongHashes);
  }

  private _data: Hashed<Rljson> = hip({});
}
