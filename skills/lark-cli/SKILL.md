---
name: lark-cli
description: >
  Use the @mission-ai/lark-cli tool to interact with Lark/Feishu Open Platform APIs via command line.
  This skill covers 7 modules (doc, wiki, chat, bitable, sheets, drive, calendar) with 72 commands total.
  Use this skill whenever you need to: read/write Lark documents, manage spreadsheets or multi-dimensional tables,
  operate on wikis, manage group chats, handle file uploads/downloads/permissions, or manage calendars and events.
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
| `chat` | 4 | Group chat management and history | Create chats, read messages, manage members |
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

### chat (4 commands)

Manage group chats, members, and message history.

| Command | Description |
|---------|-------------|
| `create` | Create a new group chat |
| `members` | List chat members |
| `history` | Get message history |
| `add-members` | Add members to a chat |

Read `references/chat.md` for full parameter details.

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

### Scheduling a calendar event

```bash
CAL_ID="primary_calendar_id"

# Create event (timestamps are Unix seconds)
npx @mission-ai/lark-cli calendar create-event "$CAL_ID" '{
  "summary": "Team Standup",
  "start_time": {"timestamp": "1700000000"},
  "end_time": {"timestamp": "1700003600"}
}'
```

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
