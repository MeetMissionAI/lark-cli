import { describe, test, expect, beforeAll, afterAll, setDefaultTimeout } from 'bun:test';
import { hasCredentials, createClient, testId } from './setup.js';
import { register } from '../../src/commands/bitable.js';

setDefaultTimeout(15_000);

describe.skipIf(!hasCredentials)('bitable E2E', () => {
  const client = createClient();
  const commands = register(client);
  let appToken: string;
  let tableId: string;

  beforeAll(async () => {
    const app = await commands['create-app']([], { name: testId() }) as any;
    appToken = app.app.app_token;
    tableId = app.app.default_table_id;
  });

  afterAll(async () => {
    // Bitable apps cannot be deleted via API — leave for manual cleanup
  });

  test('list-fields returns fields', async () => {
    const result = await commands['list-fields']([appToken, tableId], {}) as any;
    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
  });

  test('create-field, update-field, delete-field lifecycle', async () => {
    const fieldJson = JSON.stringify({ field_name: 'TestField', type: 1 });
    const created = await commands['create-field']([appToken, tableId, fieldJson], {}) as any;
    const fieldId = created.field.field_id;
    expect(fieldId).toBeDefined();

    const updateJson = JSON.stringify({ field_name: 'UpdatedField', type: 1 });
    await commands['update-field']([appToken, tableId, fieldId, updateJson], {});

    await commands['delete-field']([appToken, tableId, fieldId], {});
  });

  test('add-records, list-records, update-records, delete-records lifecycle', async () => {
    const records = JSON.stringify([{ fields: {} }]);
    const added = await commands['add-records']([appToken, tableId, records], {}) as any;
    const recordId = added.records[0].record_id;
    expect(recordId).toBeDefined();

    const listed = await commands['list-records']([appToken, tableId], {}) as any;
    expect(listed.items.length).toBeGreaterThan(0);

    const updates = JSON.stringify([{ record_id: recordId, fields: {} }]);
    await commands['update-records']([appToken, tableId, updates], {});

    await commands['delete-records']([appToken, tableId, recordId], {});
  });
});
