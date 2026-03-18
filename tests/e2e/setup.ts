import { LarkClient } from '../../src/client.js';

export const hasCredentials = !!(process.env.LARK_APP_ID && process.env.LARK_APP_SECRET);
export const testOpenId = process.env.LARK_TEST_OPEN_ID ?? '';
export const hasPermissionTestUser = hasCredentials && !!testOpenId;

export function createClient(): LarkClient {
  return new LarkClient();
}

export function testId(): string {
  return `test-${Date.now()}`;
}
