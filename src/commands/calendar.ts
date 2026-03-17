import type { LarkClient } from '../client.js';
import type { CommandMap } from '../types.js';

export function register(client: LarkClient): CommandMap {
  return {
    // ── Calendar CRUD ──────────────────────────────────────────────

    'primary': async (_args, flags) => {
      const body: Record<string, any> = {};
      if (flags['user-id']) body.user_id = flags['user-id'];
      return client.post('/calendar/v4/calendars/primary', body);
    },

    'create': async (_args, flags) => {
      const body: Record<string, any> = {};
      if (flags.summary) body.summary = flags.summary;
      if (flags.description) body.description = flags.description;
      if (flags.color) body.color = Number(flags.color);
      if (flags.permissions) body.permissions = flags.permissions;
      return client.post('/calendar/v4/calendars', body);
    },

    'delete': async (args, _flags) => {
      const [calendarId] = args;
      return client.delete(`/calendar/v4/calendars/${calendarId}`);
    },

    'get': async (args, _flags) => {
      const [calendarId] = args;
      return client.get(`/calendar/v4/calendars/${calendarId}`);
    },

    'list': async (_args, flags) => {
      const query: Record<string, string | undefined> = {};
      if (flags['page-size']) query.page_size = flags['page-size'];
      if (flags['page-token']) query.page_token = flags['page-token'];
      if (flags['sync-token']) query.sync_token = flags['sync-token'];
      return client.get('/calendar/v4/calendars', query);
    },

    'update': async (args, _flags) => {
      const [calendarId, bodyJson] = args;
      const body = JSON.parse(bodyJson);
      return client.patch(`/calendar/v4/calendars/${calendarId}`, body);
    },

    'search': async (args, flags) => {
      const [query] = args;
      const body: Record<string, any> = { query };
      if (flags['page-token']) body.page_token = flags['page-token'];
      if (flags['page-size']) body.page_size = Number(flags['page-size']);
      return client.post('/calendar/v4/calendars/search', body);
    },

    'subscribe': async (args, _flags) => {
      const [calendarId] = args;
      return client.post(`/calendar/v4/calendars/${calendarId}/subscribe`);
    },

    'unsubscribe': async (args, _flags) => {
      const [calendarId] = args;
      return client.post(`/calendar/v4/calendars/${calendarId}/unsubscribe`);
    },

    // ── Calendar ACL ───────────────────────────────────────────────

    'list-acls': async (args, flags) => {
      const [calendarId] = args;
      const query: Record<string, string | undefined> = {};
      if (flags['page-size']) query.page_size = flags['page-size'];
      if (flags['page-token']) query.page_token = flags['page-token'];
      return client.get(`/calendar/v4/calendars/${calendarId}/acls`, query);
    },

    'create-acl': async (args, _flags) => {
      const [calendarId, aclJson] = args;
      const body = JSON.parse(aclJson);
      return client.post(`/calendar/v4/calendars/${calendarId}/acls`, body);
    },

    'delete-acl': async (args, _flags) => {
      const [calendarId, aclId] = args;
      return client.delete(`/calendar/v4/calendars/${calendarId}/acls/${aclId}`);
    },

    // ── Freebusy ───────────────────────────────────────────────────

    'freebusy': async (args, _flags) => {
      const [bodyJson] = args;
      const body = JSON.parse(bodyJson);
      return client.post('/calendar/v4/freebusy/list', body);
    },

    // ── Event CRUD ─────────────────────────────────────────────────

    'create-event': async (args, _flags) => {
      const [calendarId, eventJson] = args;
      const body = JSON.parse(eventJson);
      return client.post(`/calendar/v4/calendars/${calendarId}/events`, body);
    },

    'delete-event': async (args, _flags) => {
      const [calendarId, eventId] = args;
      return client.delete(`/calendar/v4/calendars/${calendarId}/events/${eventId}`);
    },

    'get-event': async (args, _flags) => {
      const [calendarId, eventId] = args;
      return client.get(`/calendar/v4/calendars/${calendarId}/events/${eventId}`);
    },

    'list-events': async (args, flags) => {
      const [calendarId] = args;
      const query: Record<string, string | undefined> = {};
      if (flags['start-time']) query.start_time = flags['start-time'];
      if (flags['end-time']) query.end_time = flags['end-time'];
      if (flags['page-size']) query.page_size = flags['page-size'];
      if (flags['page-token']) query.page_token = flags['page-token'];
      if (flags['sync-token']) query.sync_token = flags['sync-token'];
      return client.get(`/calendar/v4/calendars/${calendarId}/events`, query);
    },

    'update-event': async (args, _flags) => {
      const [calendarId, eventId, eventJson] = args;
      const body = JSON.parse(eventJson);
      return client.patch(`/calendar/v4/calendars/${calendarId}/events/${eventId}`, body);
    },

    // ── Event Attendees ────────────────────────────────────────────

    'add-attendees': async (args, _flags) => {
      const [calendarId, eventId, attendeesJson] = args;
      const body = JSON.parse(attendeesJson);
      return client.post(
        `/calendar/v4/calendars/${calendarId}/events/${eventId}/attendees`,
        body,
      );
    },

    'list-attendees': async (args, flags) => {
      const [calendarId, eventId] = args;
      const query: Record<string, string | undefined> = {};
      if (flags['page-size']) query.page_size = flags['page-size'];
      if (flags['page-token']) query.page_token = flags['page-token'];
      return client.get(
        `/calendar/v4/calendars/${calendarId}/events/${eventId}/attendees`,
        query,
      );
    },

    'delete-attendees': async (args, _flags) => {
      const [calendarId, eventId, attendeeIdsJson] = args;
      const body = JSON.parse(attendeeIdsJson);
      return client.post(
        `/calendar/v4/calendars/${calendarId}/events/${eventId}/attendees/batch_delete`,
        body,
      );
    },

    // ── Timeoff Events ─────────────────────────────────────────────

    'create-timeoff': async (args, _flags) => {
      const [bodyJson] = args;
      const body = JSON.parse(bodyJson);
      return client.post('/calendar/v4/timeoff_events', body);
    },

    'delete-timeoff': async (args, _flags) => {
      const [timeoffEventId] = args;
      return client.delete(`/calendar/v4/timeoff_events/${timeoffEventId}`);
    },

    // ── Attendee Chat Members ──────────────────────────────────────

    'list-attendee-chat-members': async (args, flags) => {
      const [calendarId, eventId, attendeeId] = args;
      const query: Record<string, string | undefined> = {};
      if (flags['page-size']) query.page_size = flags['page-size'];
      if (flags['page-token']) query.page_token = flags['page-token'];
      return client.get(
        `/calendar/v4/calendars/${calendarId}/events/${eventId}/attendees/${attendeeId}/chat_members`,
        query,
      );
    },
  };
}
