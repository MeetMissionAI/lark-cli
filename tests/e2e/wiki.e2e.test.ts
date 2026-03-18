import { describe, test, expect } from 'bun:test';
import { hasCredentials, hasPermissionTestUser, testOpenId, createClient } from './setup.js';
import { register } from '../../src/commands/wiki.js';

const hasWikiSpace = hasCredentials && !!process.env.LARK_WIKI_SPACE_ID;
const hasWikiPermissionTest = hasWikiSpace && hasPermissionTestUser && !!process.env.LARK_WIKI_NODE_TOKEN;

describe.skipIf(!hasWikiSpace)('wiki E2E', () => {
  const client = createClient();
  const commands = register(client);
  const spaceId = process.env.LARK_WIKI_SPACE_ID!;

  test('get-space returns space info', async () => {
    const result = await commands['get-space']([spaceId], {}) as any;
    expect(result.space).toBeDefined();
    expect(result.space.name).toBeDefined();
  });

  test('list-nodes returns array', async () => {
    const result = await commands['list-nodes']([spaceId], {}) as any;
    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
  });

  describe.skipIf(!hasWikiPermissionTest)('permissions', () => {
    const nodeToken = process.env.LARK_WIKI_NODE_TOKEN!;

    test('add, list, update, remove permission lifecycle', async () => {
      const added = await commands['add-permission'](
        [nodeToken, 'openid', testOpenId, 'view'],
        {},
      ) as any;
      expect(added.member).toBeDefined();

      const listed = await commands['list-permissions']([nodeToken], {}) as any;
      expect(listed.items).toBeDefined();

      await commands['update-permission'](
        [nodeToken, 'openid', testOpenId, 'edit'],
        {},
      );

      await commands['remove-permission'](
        [nodeToken, 'openid', testOpenId],
        {},
      );
    });
  });
});
