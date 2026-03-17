import { describe, test, expect, beforeAll } from 'bun:test';
import { hasCredentials, createClient, testId } from './setup.js';
import { register } from '../../src/commands/chat.js';

describe.skipIf(!hasCredentials)('chat E2E', () => {
  const client = createClient();
  const commands = register(client);
  let chatId: string;

  beforeAll(async () => {
    const result = await commands['create']([testId()], {}) as any;
    chatId = result.chat_id;
  });

  test('members returns member list', async () => {
    const result = await commands['members']([chatId], {}) as any;
    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
  });

  test('history returns messages', async () => {
    const result = await commands['history']([chatId], {}) as any;
    expect(result.items).toBeDefined();
  });
});
