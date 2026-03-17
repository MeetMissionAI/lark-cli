import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { hasCredentials, createClient, testId } from './setup.js';
import { register } from '../../src/commands/calendar.js';

describe.skipIf(!hasCredentials)('calendar E2E', () => {
  const client = createClient();
  const commands = register(client);
  let calendarId: string;
  let eventId: string;

  beforeAll(async () => {
    const result = await commands['create']([], {
      summary: testId(),
      description: 'E2E test calendar',
    }) as any;
    calendarId = result.calendar.calendar_id;
  });

  afterAll(async () => {
    if (calendarId) {
      await commands['delete']([calendarId], {});
    }
  });

  // ── Calendar Management ────────────────────────────────────────

  test('get returns calendar info', async () => {
    const result = await commands['get']([calendarId], {}) as any;
    expect(result.calendar_id || result.calendar).toBeDefined();
  });

  test('list returns calendar list', async () => {
    const result = await commands['list']([], {}) as any;
    expect(result.calendar_list).toBeDefined();
    expect(Array.isArray(result.calendar_list)).toBe(true);
  });

  test('update modifies calendar', async () => {
    const newSummary = testId();
    const result = await commands['update'](
      [calendarId, JSON.stringify({ summary: newSummary })],
      {},
    ) as any;
    expect(result.calendar).toBeDefined();
  });

  test('list-acls returns ACL list', async () => {
    const result = await commands['list-acls']([calendarId], {}) as any;
    expect(result.acls).toBeDefined();
  });

  test('subscribe and unsubscribe work', async () => {
    const subResult = await commands['subscribe']([calendarId], {}) as any;
    expect(subResult.calendar || subResult).toBeDefined();

    const unsubResult = await commands['unsubscribe']([calendarId], {}) as any;
    expect(unsubResult).toBeDefined();
  });

  // ── Event Management ───────────────────────────────────────────

  test('create-event creates an event', async () => {
    const now = Math.floor(Date.now() / 1000);
    const eventJson = JSON.stringify({
      summary: testId(),
      start_time: { timestamp: String(now + 3600) },
      end_time: { timestamp: String(now + 7200) },
    });
    const result = await commands['create-event'](
      [calendarId, eventJson],
      {},
    ) as any;
    expect(result.event).toBeDefined();
    eventId = result.event.event_id;
  });

  test('get-event returns event info', async () => {
    const result = await commands['get-event'](
      [calendarId, eventId],
      {},
    ) as any;
    expect(result.event).toBeDefined();
  });

  test('list-events returns events', async () => {
    const result = await commands['list-events'](
      [calendarId],
      {},
    ) as any;
    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
  });

  test('update-event modifies event', async () => {
    const result = await commands['update-event'](
      [calendarId, eventId, JSON.stringify({ summary: testId() })],
      {},
    ) as any;
    expect(result.event).toBeDefined();
  });

  test('list-attendees returns attendee list', async () => {
    const result = await commands['list-attendees'](
      [calendarId, eventId],
      {},
    ) as any;
    expect(result.items).toBeDefined();
  });

  test('delete-event removes event', async () => {
    const result = await commands['delete-event'](
      [calendarId, eventId],
      {},
    );
    expect(result).toBeDefined();
  });
});
