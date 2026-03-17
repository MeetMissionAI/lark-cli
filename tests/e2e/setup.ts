import { LarkClient } from '../../src/client.js';

export const hasCredentials = !!(process.env.LARK_APP_ID && process.env.LARK_APP_SECRET);

export function createClient(): LarkClient {
  return new LarkClient();
}

export function testId(): string {
  return `test-${Date.now()}`;
}
