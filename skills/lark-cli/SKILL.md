---
name: lark-cli
description: >
  Use the @mission-ai/lark-cli tool to interact with Lark/Feishu Open Platform APIs via command line.
  This skill covers 6 modules (doc, wiki, bitable, sheets, drive, calendar) with 68 commands total.
  Use this skill whenever you need to: read/write Lark documents, manage spreadsheets or multi-dimensional tables,
  operate on wikis, handle file uploads/downloads/permissions, or manage calendars and events.
  Also use when the user mentions Feishu, Lark, 飞书, or any Lark workspace automation tasks.
---

# Lark CLI

A zero-dependency CLI tool wrapping Lark/Feishu Open Platform APIs. Designed for AI agents — all output is JSON, no interactive prompts.

## Invocation

```bash
npx @mission-ai/lark-cli <module> <command> [positional-args...] [--flag value]
```

No local installation needed — `npx` fetches and runs the package directly.

## Authentication

Two environment variables must be set before any command:

```bash
export LARK_APP_ID="cli_xxx"
export LARK_APP_SECRET="xxx"
```

These are the credentials of a Lark custom app (self-built application). The CLI uses `tenant_access_token` internally — it does NOT support `user_access_token`. This means:
- The app must have the relevant API scopes enabled in the Lark Developer Console
- The app must be granted access to target resources (documents, calendars, etc.)
- User-only APIs (e.g., event search, CalDAV) are not available

Optionally, override the base URL for Feishu (China) deployments:

```bash
export LARK_BASE_URL="https://open.feishu.cn/open-apis"   # default is larksuite.com
```

## Critical: App vs User Visibility

Because the CLI uses `tenant_access_token`, everything is created **as the app**, not as the user. This has two major consequences:

1. **Documents/Spreadsheets/Bitables**: Created resources are owned by the app. The user can only read them. → **Transfer ownership** after creation (see below).
2. **Calendar events**: Events created on the app's primary calendar are **completely invisible** to users. → **NEVER create events on the app's primary calendar.** Always create a shared calendar first, grant the user access, then create events there. See "Creating calendar events for a user" in Common Patterns below.

**The user's OpenID (`ou_xxx`) is required for both workflows.** If the user has not provided their OpenID, you must ask for it before creating any resource or calendar event.

## Ownership Transfer After Creation

Because the CLI uses `tenant_access_token`, any resource created (doc, spreadsheet, bitable, etc.) is **owned by the app**, not by the user who requested it. The user will only have read access by default and cannot edit.

To fix this, **always transfer ownership** to the requesting user after creating a resource:

```bash
# After creating a doc
npx @mission-ai/lark-cli drive transfer-owner DOC_TOKEN docx openid USER_OPEN_ID

# After creating a spreadsheet
npx @mission-ai/lark-cli sheets transfer-owner SHEET_TOKEN openid USER_OPEN_ID

# After creating a bitable
npx @mission-ai/lark-cli bitable transfer-owner APP_TOKEN openid USER_OPEN_ID
```

**The user's OpenID (Lark User ID) is required for this step.** If the user has not provided their OpenID, you must ask for it before creating any resource. Without it, the user will be unable to edit what was created on their behalf.

How to find OpenID: The user can find it in their Lark admin console, or you can look it up if you have access to the Lark contact API.

## Output Convention

- **Success**: stdout prints JSON (the `data` field from the Lark API response), exit code `0`
- **Failure**: stderr prints `{"error": "message", "code": 12345}`, exit code `1`

Parse output with `jq` or pipe directly into your workflow. The `code` field maps to Lark's error codes documented at https://open.larksuite.com/document/server-docs/getting-started/server-error-codes.

## Stdin Support

For commands that accept JSON body, you can pipe data via stdin:

```bash
echo '{"summary":"Meeting"}' | npx @mission-ai/lark-cli calendar update CAL_ID --stdin
```

The `--stdin` flag appends stdin content as the last positional argument.

## Pagination

Many `list-*` commands support pagination via `--page-size` and `--page-token`. The response includes `page_token` and `has_more` fields. To fetch all pages:

```bash
# First page
npx @mission-ai/lark-cli sheets list-records APP_TOKEN TABLE_ID --page-size 100

# Next page (use page_token from previous response)
npx @mission-ai/lark-cli sheets list-records APP_TOKEN TABLE_ID --page-size 100 --page-token "xxx"
```

## Modules Overview

| Module | Cmds | Description | When to Use |
|--------|------|-------------|-------------|
| `doc` | 8 | Cloud document CRUD, block ops, export/download | Read/write/export Lark Docs |
| `wiki` | 4 | Knowledge base spaces and nodes | Manage wiki structure |
| `bitable` | 12 | Multi-dimensional table (Airtable-like) | Structured data CRUD, field management |
| `sheets` | 14 | Spreadsheets | Cell read/write, sheet management, find/replace |
| `drive` | 6 | File permissions + media transfer | Upload/download files, manage sharing |
| `calendar` | 24 | Calendars and events | Schedule management, attendees, freebusy |

## Module Quick Reference

### doc (8 commands)

Manage Lark cloud documents — read content, manipulate blocks, create/export.

| Command | Description |
|---------|-------------|
| `get` | Get document title + raw text content |
| `get-blocks` | Get document block tree (or children of a block) |
| `create` | Create a new document |
| `insert` | Insert markdown content into a block |
| `update` | Update a block's properties |
| `delete` | Delete child blocks by index range |
| `create-block` | Insert raw block JSON as children |
| `download` | Export document to file (docx/pdf/etc.) |

Read `references/doc.md` for full parameter details.

### wiki (4 commands)

Manage knowledge base spaces and wiki nodes.

| Command | Description |
|---------|-------------|
| `get-space` | Get wiki space info |
| `get-node` | Get a wiki node by token |
| `list-nodes` | List child nodes in a space |
| `create-node` | Add a document to a wiki space |

Read `references/wiki.md` for full parameter details.

### bitable (12 commands)

Multi-dimensional tables (like Airtable) — app/table/field/record CRUD.

| Command | Description |
|---------|-------------|
| `create-app` | Create a new bitable app |
| `create-tables` | Batch create tables |
| `delete-tables` | Batch delete tables |
| `list-fields` | List fields (columns) of a table |
| `create-field` | Add a field to a table |
| `update-field` | Update field properties |
| `delete-field` | Delete a field |
| `list-records` | List records with optional filter |
| `add-records` | Batch insert records |
| `update-records` | Batch update records |
| `delete-records` | Batch delete records |
| `transfer-owner` | Transfer bitable ownership |

Read `references/bitable.md` for full parameter details.

### sheets (14 commands)

Spreadsheet operations — read/write cells, manage sheets, find/replace.

| Command | Description |
|---------|-------------|
| `create` | Create a new spreadsheet |
| `metadata` | Get spreadsheet metadata (sheets, properties) |
| `read` | Read cell values by range |
| `write` | Write cell values to a range |
| `append` | Append rows after existing data |
| `prepend` | Prepend rows before existing data |
| `add-sheet` | Add a worksheet tab |
| `delete-sheet` | Delete a worksheet tab |
| `update-sheet` | Update worksheet properties |
| `add-dimension` | Add rows or columns |
| `delete-dimension` | Delete rows or columns |
| `find` | Search for values in a sheet |
| `replace` | Find and replace values |
| `transfer-owner` | Transfer spreadsheet ownership |

Read `references/sheets.md` for full parameter details.

### drive (6 commands)

File permissions management and media upload/download.

| Command | Description |
|---------|-------------|
| `update-permission` | Update member's permission on a file |
| `transfer-owner` | Transfer file ownership |
| `upload` | Upload a file to Drive |
| `download-image` | Download an image by key |
| `download-file` | Download a file by key |
| `download-message-resource` | Download a message attachment |

Read `references/drive.md` for full parameter details.

### calendar (24 commands)

Calendar management, events, attendees, freebusy, and timeoff.

| Command | Description |
|---------|-------------|
| `primary` | Get primary calendar |
| `create` | Create a shared calendar |
| `delete` | Delete a calendar |
| `get` | Get calendar info |
| `list` | List calendars |
| `update` | Update calendar properties |
| `search` | Search calendars by keyword |
| `subscribe` | Subscribe to a calendar |
| `unsubscribe` | Unsubscribe from a calendar |
| `list-acls` | List calendar access controls |
| `create-acl` | Grant calendar access |
| `delete-acl` | Revoke calendar access |
| `freebusy` | Query freebusy information |
| `create-event` | Create a calendar event |
| `delete-event` | Delete an event |
| `get-event` | Get event details |
| `list-events` | List events (with time range filter) |
| `update-event` | Update an event |
| `add-attendees` | Add attendees to an event |
| `list-attendees` | List event attendees |
| `delete-attendees` | Remove attendees from an event |
| `create-timeoff` | Create a leave/timeoff event |
| `delete-timeoff` | Delete a timeoff event |
| `list-attendee-chat-members` | List chat members of an attendee |

Read `references/calendar.md` for full parameter details.

## Common Patterns

### Creating a document and adding it to wiki

```bash
# Create doc
DOC=$(npx @mission-ai/lark-cli doc create --title "Meeting Notes" --folder FOLDER_TOKEN | jq -r '.document.document_id')

# Transfer ownership to the user (required, otherwise user can only read)
npx @mission-ai/lark-cli drive transfer-owner "$DOC" docx openid USER_OPEN_ID

# Add to wiki
npx @mission-ai/lark-cli wiki create-node SPACE_ID docx "$DOC" --title "Meeting Notes"
```

### Reading and updating spreadsheet data

```bash
# Read range A1:D10
npx @mission-ai/lark-cli sheets read SHEET_TOKEN 'SheetId!A1:D10'

# Append rows
npx @mission-ai/lark-cli sheets append SHEET_TOKEN 'SheetId!A1:D1' '[["Alice",30,"Engineer","2024-01-15"]]'
```

### Creating calendar events for a user (CRITICAL WORKFLOW)

Because the CLI uses `tenant_access_token`, the app has its own primary calendar that is **invisible to users**. You **MUST NOT** create events on the app's primary calendar — the user will never see them.

**Required steps — follow this exact order:**

```bash
# 1. Create a shared calendar (visible to both the app and the user)
CAL=$(npx @mission-ai/lark-cli calendar create --summary "Project Schedule" | jq -r '.calendar.calendar_id')

# 2. Grant the user "owner" role on the calendar so they can see and manage it
npx @mission-ai/lark-cli calendar create-acl "$CAL" '{"role":"owner","scope":{"type":"user","user_id":"ou_USER_OPEN_ID"}}'

# 3. Subscribe the calendar so it appears in the app's calendar list (required for creating events)
npx @mission-ai/lark-cli calendar subscribe "$CAL"

# 4. NOW create events on the shared calendar
npx @mission-ai/lark-cli calendar create-event "$CAL" '{
  "summary": "Team Standup",
  "start_time": {"timestamp": "1700000000"},
  "end_time": {"timestamp": "1700003600"}
}'
```

**Rules:**
- **NEVER** use the app's primary calendar ID for creating events meant for users
- **ALWAYS** create a shared calendar first, then grant user access, then create events
- The user's OpenID (`ou_xxx`) is required — ask for it if not provided
- If creating multiple events for the same user, reuse the same shared calendar — do NOT create a new calendar for each event
- Grant `owner` role (not `reader` or `writer`) so the user has full control

### Managing bitable records

```bash
# List records with filter
npx @mission-ai/lark-cli bitable list-records APP_TOKEN TABLE_ID --filter 'CurrentValue.[Status]="Active"'

# Batch update
npx @mission-ai/lark-cli bitable update-records APP_TOKEN TABLE_ID '[
  {"record_id":"recXXX","fields":{"Status":"Done"}},
  {"record_id":"recYYY","fields":{"Status":"Done"}}
]'
```

## Limitations

- **Auth scope**: Only `tenant_access_token` — user-only APIs are not available
- **Rate limits**: Subject to Lark API rate limits (typically 50-100 QPS per app)
- **File size**: Upload limit depends on Lark plan (typically 20MB for free tier)
- **JSON arguments**: Complex bodies must be valid JSON strings — escape carefully in shell
- **No streaming**: All responses are buffered, not streamed
