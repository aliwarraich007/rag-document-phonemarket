#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/62de1cc2269b015a5f4c910e82a87665e5b6e021a24e85ab9671b7e52618d422/contract';
import endContract from '../../snapshots/62de1cc2269b015a5f4c910e82a87665e5b6e021a24e85ab9671b7e52618d422/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/687f70b8f12c55de29a6caec00aac1301f21f1ec7bb1b2d7ce6ea1116c5b0e71/contract';
import startContract from '../../snapshots/687f70b8f12c55de29a6caec00aac1301f21f1ec7bb1b2d7ce6ea1116c5b0e71/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropTable({ schema: 'public', table: 'created_at' }),
      this.createTable({
        schema: 'public',
        table: 'document_chunk',
        columns: [
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('embedding', 'vector(1536)', {
            notNull: true,
            codecRef: { codecId: 'pg/vector@1', typeParams: { length: 1536 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('metadata', 'json', { codecRef: { codecId: 'pg/json@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
