import { describe, test, expect } from 'bun:test';
import { hasCredentials, createClient } from './setup.js';
import { register } from '../../src/commands/wiki.js';

const hasWikiSpace = hasCredentials && !!process.env.LARK_WIKI_SPACE_ID;

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
});
