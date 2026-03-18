import { describe, test, expect } from 'bun:test';
import { writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { hasCredentials, hasPermissionTestUser, testOpenId, createClient } from './setup.js';
import { register } from '../../src/commands/drive.js';

describe.skipIf(!hasCredentials)('drive E2E', () => {
  const client = createClient();
  const commands = register(client);
  let fileToken: string;

  test('upload file and get token', async () => {
    const tmpFile = join(import.meta.dir, 'test-upload.txt');
    await writeFile(tmpFile, 'hello from lark-cli E2E test');

    try {
      const result = await commands['upload']([tmpFile], {}) as any;
      fileToken = result.file_token;
      expect(fileToken).toBeDefined();
    } finally {
      await unlink(tmpFile).catch(() => {});
    }
  });

  describe.skipIf(!hasPermissionTestUser)('permissions', () => {
    test('add, list, update, remove permission lifecycle', async () => {
      const added = await commands['add-permission'](
        [fileToken, 'openid', testOpenId, 'view'],
        {},
      ) as any;
      expect(added.member).toBeDefined();

      const listed = await commands['list-permissions']([fileToken], {}) as any;
      expect(listed.items).toBeDefined();

      await commands['update-permission'](
        [fileToken, 'openid', testOpenId, 'edit'],
        {},
      );

      await commands['remove-permission'](
        [fileToken, 'openid', testOpenId],
        {},
      );
    });
  });
});
