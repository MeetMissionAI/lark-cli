import { describe, test, expect, beforeAll } from 'bun:test';
import { hasCredentials, hasPermissionTestUser, testOpenId, createClient, testId } from './setup.js';
import { register } from '../../src/commands/doc.js';

describe.skipIf(!hasCredentials)('doc E2E', () => {
  const client = createClient();
  const commands = register(client);
  let documentId: string;

  beforeAll(async () => {
    const result = await commands['create']([], { title: testId() }) as any;
    documentId = result.document.document_id;
  });

  test('get returns title and content', async () => {
    const result = await commands['get']([documentId], {}) as any;
    expect(result.title).toBeDefined();
    expect(result.content).toBeDefined();
  });

  test('get-blocks returns block structure', async () => {
    const result = await commands['get-blocks']([documentId], {}) as any;
    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
  });

  test('insert markdown and verify', async () => {
    // Get document root block ID (same as documentId for root)
    const result = await commands['insert'](
      [documentId, documentId, '## Test Heading\n\nHello from E2E test'],
      {},
    ) as any;
    expect(result.inserted_blocks).toBeGreaterThan(0);

    // Verify blocks were added
    const blocks = await commands['get-blocks']([documentId], {}) as any;
    expect(blocks.items.length).toBeGreaterThan(1);
  });

  describe.skipIf(!hasPermissionTestUser)('permissions', () => {
    test('add, list, update, remove permission lifecycle', async () => {
      // add
      const added = await commands['add-permission'](
        [documentId, 'openid', testOpenId, 'view'],
        {},
      ) as any;
      expect(added.member).toBeDefined();

      // list
      const listed = await commands['list-permissions']([documentId], {}) as any;
      expect(listed.items).toBeDefined();

      // update
      await commands['update-permission'](
        [documentId, 'openid', testOpenId, 'edit'],
        {},
      );

      // remove
      await commands['remove-permission'](
        [documentId, 'openid', testOpenId],
        {},
      );
    });
  });
});
