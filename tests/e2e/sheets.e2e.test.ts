import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { hasCredentials, hasPermissionTestUser, testOpenId, createClient, testId } from './setup.js';
import { register } from '../../src/commands/sheets.js';

describe.skipIf(!hasCredentials)('sheets E2E', () => {
  const client = createClient();
  const commands = register(client);
  let token: string;
  let sheetId: string;

  beforeAll(async () => {
    const result = await commands['create']([], { title: testId() }) as any;
    token = result.spreadsheet.spreadsheet_token;

    const meta = await commands['metadata']([token], {}) as any;
    sheetId = meta.sheets[0].sheetId;
  });

  afterAll(async () => {
    // No API to delete spreadsheets — leave for manual cleanup
  });

  test('write and read range', async () => {
    const values = JSON.stringify([['Hello', 'World'], ['Foo', 'Bar']]);
    await commands['write']([token, `${sheetId}!A1:B2`, values], {});

    const result = await commands['read']([token, `${sheetId}!A1:B2`], {}) as any;
    expect(result.valueRange.values).toBeDefined();
    expect(result.valueRange.values.length).toBe(2);
  });

  test('append rows', async () => {
    const values = JSON.stringify([['Appended1', 'Appended2']]);
    const result = await commands['append']([token, `${sheetId}!A1:B1`, values], {}) as any;
    expect(result).toBeDefined();
  });

  test('find value', async () => {
    const result = await commands['find']([token, sheetId, 'Foo'], { range: `${sheetId}!A1:B3` }) as any;
    expect(result.find_result).toBeDefined();
  });

  test('replace value', async () => {
    const result = await commands['replace']([token, sheetId, 'Foo', 'Baz'], { range: `${sheetId}!A1:B3` }) as any;
    expect(result).toBeDefined();
  });

  test('add-sheet and delete-sheet lifecycle', async () => {
    const added = await commands['add-sheet']([token, 'TempSheet'], {}) as any;
    const newSheetId = added.replies[0].addSheet.properties.sheetId;
    expect(newSheetId).toBeDefined();

    await commands['delete-sheet']([token, newSheetId], {});
  });

  describe.skipIf(!hasPermissionTestUser)('permissions', () => {
    test('add, list, update, remove permission lifecycle', async () => {
      const added = await commands['add-permission'](
        [token, 'openid', testOpenId, 'view'],
        {},
      ) as any;
      expect(added.member).toBeDefined();

      const listed = await commands['list-permissions']([token], {}) as any;
      expect(listed.items).toBeDefined();

      await commands['update-permission'](
        [token, 'openid', testOpenId, 'edit'],
        {},
      );

      await commands['remove-permission'](
        [token, 'openid', testOpenId],
        {},
      );
    });
  });
});
