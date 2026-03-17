# bitable Module Reference

Bitables are Lark's multi-dimensional tables (similar to Airtable). Key concepts:
- **App** (`app_token`) — A bitable document, contains multiple tables
- **Table** (`table_id`) — A single table within an app
- **Field** — A column definition (text, number, select, etc.)
- **Record** — A row of data

## create-app

Create a new bitable app.

```bash
npx @mission-ai/lark-cli bitable create-app [--name NAME] [--folder FOLDER_TOKEN]
```

**Flags:**
- `--name` — App name
- `--folder` — Folder token to create in

**Output:** `{ app: { app_token, name, ... } }`

## create-tables

Batch create tables in a bitable app.

```bash
npx @mission-ai/lark-cli bitable create-tables <appToken> <tablesJson>
```

**Args:**
- `appToken` — Bitable app token
- `tablesJson` — JSON array of table definitions

**Example:**
```bash
npx @mission-ai/lark-cli bitable create-tables appXXX '[{"name":"Tasks"},{"name":"Projects"}]'
```

## delete-tables

Batch delete tables.

```bash
npx @mission-ai/lark-cli bitable delete-tables <appToken> <tableId1> [tableId2] [...]
```

**Args:**
- `appToken` — Bitable app token
- Remaining args — Table IDs to delete

## list-fields

List all fields (columns) of a table.

```bash
npx @mission-ai/lark-cli bitable list-fields <appToken> <tableId>
```

**Args:**
- `appToken` — Bitable app token
- `tableId` — Table ID

**Output:** `{ items: [{ field_id, field_name, type, ... }] }`

## create-field

Add a new field to a table.

```bash
npx @mission-ai/lark-cli bitable create-field <appToken> <tableId> <fieldJson>
```

**Args:**
- `appToken` — Bitable app token
- `tableId` — Table ID
- `fieldJson` — Field definition JSON

**Example:**
```bash
npx @mission-ai/lark-cli bitable create-field appXXX tblXXX '{"field_name":"Priority","type":3}'
```

Field types: 1=Text, 2=Number, 3=SingleSelect, 4=MultiSelect, 5=DateTime, 7=Checkbox, 11=User, 13=Phone, 15=URL, etc.

## update-field

Update a field's properties.

```bash
npx @mission-ai/lark-cli bitable update-field <appToken> <tableId> <fieldId> <fieldJson>
```

**Args:**
- `appToken` — Bitable app token
- `tableId` — Table ID
- `fieldId` — Field ID
- `fieldJson` — Updated field properties JSON

## delete-field

Delete a field from a table.

```bash
npx @mission-ai/lark-cli bitable delete-field <appToken> <tableId> <fieldId>
```

## list-records

List records with optional filtering.

```bash
npx @mission-ai/lark-cli bitable list-records <appToken> <tableId> [--filter EXPR] [--page-size N] [--page-token T]
```

**Args:**
- `appToken` — Bitable app token
- `tableId` — Table ID

**Flags:**
- `--filter` — Filter expression (e.g., `CurrentValue.[Status]="Active"`)
- `--page-size` — Records per page (max 500)
- `--page-token` — Pagination token

**Output:** `{ items: [{ record_id, fields: {...} }], page_token, has_more, total }`

## add-records

Batch insert records.

```bash
npx @mission-ai/lark-cli bitable add-records <appToken> <tableId> <recordsJson>
```

**Args:**
- `appToken` — Bitable app token
- `tableId` — Table ID
- `recordsJson` — JSON array of record objects

**Example:**
```bash
npx @mission-ai/lark-cli bitable add-records appXXX tblXXX '[
  {"fields":{"Name":"Alice","Age":30}},
  {"fields":{"Name":"Bob","Age":25}}
]'
```

## update-records

Batch update existing records.

```bash
npx @mission-ai/lark-cli bitable update-records <appToken> <tableId> <recordsJson>
```

**Args:**
- `recordsJson` — JSON array with `record_id` and `fields`

**Example:**
```bash
npx @mission-ai/lark-cli bitable update-records appXXX tblXXX '[
  {"record_id":"recXXX","fields":{"Status":"Done"}}
]'
```

## delete-records

Batch delete records.

```bash
npx @mission-ai/lark-cli bitable delete-records <appToken> <tableId> <recordId1> [recordId2] [...]
```

## transfer-owner

Transfer bitable ownership.

```bash
npx @mission-ai/lark-cli bitable transfer-owner <appToken> <memberType> <memberId>
```

**Args:**
- `appToken` — Bitable app token
- `memberType` — `openid`, `userid`, etc.
- `memberId` — Member identifier
