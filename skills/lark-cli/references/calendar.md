# calendar Module Reference

Manages calendars, events, attendees, ACLs, freebusy, and timeoff events.

> **WARNING**: NEVER create events on the app's primary calendar — users cannot see them. Always create a shared calendar first, grant the user `owner` access via `create-acl`, subscribe to it, then create events there. See SKILL.md "Common Patterns" for the full workflow.

Key concepts:
- **Calendar ID** (`calendarId`) — Unique ID of a calendar
- **Event ID** (`eventId`) — Unique ID of an event within a calendar
- **Timestamps** — Unix seconds as strings (e.g., `"1700000000"`)

---

## Calendar CRUD

### primary

Get the primary calendar of a user.

```bash
npx @mission-ai/lark-cli calendar primary [--user-id USER_ID]
```

**Flags:**
- `--user-id` — (optional) User ID; omit to get the app's default

### create

Create a new shared calendar.

```bash
npx @mission-ai/lark-cli calendar create [--summary S] [--description D] [--color N] [--permissions P]
```

**Flags:**
- `--summary` — Calendar name
- `--description` — Calendar description
- `--color` — Color index (integer)
- `--permissions` — Permission scope: `private`, `show_only_free_busy`, `reader`, `writer`, `owner`

**Output:** `{ calendar: { calendar_id, summary, ... } }`

### delete

```bash
npx @mission-ai/lark-cli calendar delete <calendarId>
```

### get

```bash
npx @mission-ai/lark-cli calendar get <calendarId>
```

### list

```bash
npx @mission-ai/lark-cli calendar list [--page-size N] [--page-token T] [--sync-token T]
```

**Output:** `{ calendar_list: [...], page_token, sync_token }`

### update

```bash
npx @mission-ai/lark-cli calendar update <calendarId> <bodyJson>
```

**Args:**
- `bodyJson` — JSON with fields to update (e.g., `{"summary":"New Name"}`)

### search

Search calendars by keyword.

```bash
npx @mission-ai/lark-cli calendar search <query> [--page-token T] [--page-size N]
```

### subscribe

```bash
npx @mission-ai/lark-cli calendar subscribe <calendarId>
```

### unsubscribe

```bash
npx @mission-ai/lark-cli calendar unsubscribe <calendarId>
```

---

## Calendar ACL

### list-acls

```bash
npx @mission-ai/lark-cli calendar list-acls <calendarId> [--page-size N] [--page-token T]
```

**Output:** `{ acls: [{ acl_id, role, scope, ... }] }`

### create-acl

Grant access to a calendar.

```bash
npx @mission-ai/lark-cli calendar create-acl <calendarId> <aclJson>
```

**Example:**
```bash
npx @mission-ai/lark-cli calendar create-acl CAL_ID '{"role":"reader","scope":{"type":"user","user_id":"ou_xxx"}}'
```

### delete-acl

```bash
npx @mission-ai/lark-cli calendar delete-acl <calendarId> <aclId>
```

---

## Freebusy

### freebusy

Query freebusy information for users/rooms.

```bash
npx @mission-ai/lark-cli calendar freebusy <bodyJson>
```

**Example:**
```bash
npx @mission-ai/lark-cli calendar freebusy '{
  "time_min": "2024-01-01T00:00:00+08:00",
  "time_max": "2024-01-02T00:00:00+08:00",
  "user_id": {"user_ids": ["ou_xxx"]}
}'
```

---

## Event CRUD

### create-event

```bash
npx @mission-ai/lark-cli calendar create-event <calendarId> <eventJson>
```

**Example:**
```bash
npx @mission-ai/lark-cli calendar create-event CAL_ID '{
  "summary": "Team Sync",
  "description": "Weekly standup",
  "start_time": {"timestamp": "1700000000"},
  "end_time": {"timestamp": "1700003600"},
  "attendees": [{"type": "user", "user_id": "ou_xxx"}]
}'
```

**Output:** `{ event: { event_id, summary, ... } }`

### delete-event

```bash
npx @mission-ai/lark-cli calendar delete-event <calendarId> <eventId>
```

### get-event

```bash
npx @mission-ai/lark-cli calendar get-event <calendarId> <eventId>
```

### list-events

```bash
npx @mission-ai/lark-cli calendar list-events <calendarId> [--start-time TS] [--end-time TS] [--page-size N] [--page-token T] [--sync-token T]
```

**Flags:**
- `--start-time` — Unix seconds (inclusive)
- `--end-time` — Unix seconds (exclusive)

**Output:** `{ items: [{ event_id, summary, ... }], page_token, has_more }`

### update-event

```bash
npx @mission-ai/lark-cli calendar update-event <calendarId> <eventId> <eventJson>
```

**Args:**
- `eventJson` — JSON with fields to update

---

## Event Attendees

### add-attendees

```bash
npx @mission-ai/lark-cli calendar add-attendees <calendarId> <eventId> <attendeesJson>
```

**Example:**
```bash
npx @mission-ai/lark-cli calendar add-attendees CAL_ID EVT_ID '{
  "attendees": [{"type": "user", "user_id": "ou_xxx"}]
}'
```

### list-attendees

```bash
npx @mission-ai/lark-cli calendar list-attendees <calendarId> <eventId> [--page-size N] [--page-token T]
```

**Output:** `{ items: [{ type, attendee_id, ... }] }`

### delete-attendees

```bash
npx @mission-ai/lark-cli calendar delete-attendees <calendarId> <eventId> <attendeeIdsJson>
```

**Example:**
```bash
npx @mission-ai/lark-cli calendar delete-attendees CAL_ID EVT_ID '{
  "attendee_ids": ["att_xxx", "att_yyy"]
}'
```

---

## Timeoff Events

### create-timeoff

Create a leave/timeoff event.

```bash
npx @mission-ai/lark-cli calendar create-timeoff <bodyJson>
```

**Example:**
```bash
npx @mission-ai/lark-cli calendar create-timeoff '{
  "user_id": "ou_xxx",
  "timezone": "Asia/Shanghai",
  "start_time": "2024-01-15",
  "end_time": "2024-01-16",
  "title": "Annual Leave"
}'
```

### delete-timeoff

```bash
npx @mission-ai/lark-cli calendar delete-timeoff <timeoffEventId>
```

---

## Attendee Chat Members

### list-attendee-chat-members

List members of a chat-type attendee.

```bash
npx @mission-ai/lark-cli calendar list-attendee-chat-members <calendarId> <eventId> <attendeeId> [--page-size N] [--page-token T]
```

**Output:** `{ items: [{ member_id, ... }] }`
