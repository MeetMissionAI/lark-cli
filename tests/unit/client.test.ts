import { describe, test, expect, beforeEach } from 'bun:test';
import { LarkClient } from '../../src/client.js';

describe('LarkClient', () => {
  beforeEach(() => {
    process.env.LARK_APP_ID = 'test-id';
    process.env.LARK_APP_SECRET = 'test-secret';
  });

  test('throws when env vars are missing', () => {
    delete process.env.LARK_APP_ID;
    delete process.env.LARK_APP_SECRET;
    expect(() => new LarkClient()).toThrow('LARK_APP_ID and LARK_APP_SECRET must be set');
  });

  test('constructs with default base URL', () => {
    const client = new LarkClient();
    expect(client).toBeDefined();
  });

  test('respects LARK_BASE_URL override', () => {
    process.env.LARK_BASE_URL = 'https://custom.api.com';
    const client = new LarkClient();
    expect(client).toBeDefined();
    delete process.env.LARK_BASE_URL;
  });
});
