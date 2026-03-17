import { describe, test, expect } from 'bun:test';
import { writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { hasCredentials, createClient } from './setup.js';
import { register } from '../../src/commands/drive.js';

describe.skipIf(!hasCredentials)('drive E2E', () => {
  const client = createClient();
  const commands = register(client);

  test('upload file and get token', async () => {
    const tmpFile = join(import.meta.dir, 'test-upload.txt');
    await writeFile(tmpFile, 'hello from lark-cli E2E test');

    try {
      const result = await commands['upload']([tmpFile], {}) as any;
      expect(result.file_token).toBeDefined();
    } finally {
      await unlink(tmpFile).catch(() => {});
    }
  });
});
