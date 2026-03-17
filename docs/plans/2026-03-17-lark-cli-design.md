# Lark CLI Design Document

**Date**: 2026-03-17
**Status**: Approved

## Context

Stella (our AI Agent system) integrates with Lark via MCP servers tightly coupled to NestJS. This creates three problems:

1. **Portability** — Lark tools can't be used outside Stella (e.g., in Claude Code or other agents)
2. **Coupling** — MCP server code depends on NestJS services (LarkApiClient, LarkTokenService)
3. **Testability** — MCP tools are tested through the SDK layer, not directly

This project extracts all Lark API tooling into a standalone CLI package (`@mission-ai/lark-cli`) with zero framework dependencies.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Single CLI package | 48 commands are small in total; multi-package adds versioning overhead |
| Target user | AI Agent only | Output JSON, no interactive prompts, no colored formatting |
| Package manager | bun | Consistent with Stella ecosystem |
| Distribution | npm (`@mission-ai/lark-cli`) | `npx` invocation for any agent |
| External dependencies | Zero | Only native fetch + node:fs |
| Test framework | bun test | Built-in, fast, no extra dependency |
| E2E strategy | Self-create, self-cleanup | Each test suite creates resources in setup, deletes in teardown |
| Lark client replication | Standalone in this repo | Replicate token + HTTP logic from Stella's LarkTokenService/LarkApiClient |

## Architecture

### Project Structure

```
lark-cli/
├── src/
│   ├── cli.ts                 ← bin entry, subcommand routing
│   ├── client.ts              ← Lark HTTP client (token + request)
│   ├── types.ts               ← shared type definitions
│   └── commands/
│       ├── doc.ts             ← cloud documents (8 commands)
│       ├── wiki.ts            ← knowledge base (4 commands)
│       ├── chat.ts            ← group chat (4 commands)
│       ├── bitable.ts         ← multi-dimensional tables (12 commands)
│       ├── sheets.ts          ← spreadsheets (14 commands)
│       └── drive.ts           ← permissions & media (6 commands)
├── tests/
│   ├── e2e/
│   │   ├── setup.ts           ← shared test utilities
│   │   ├── doc.e2e.test.ts
│   │   ├── wiki.e2e.test.ts
│   │   ├── chat.e2e.test.ts
│   │   ├── bitable.e2e.test.ts
│   │   ├── sheets.e2e.test.ts
│   │   └── drive.e2e.test.ts
│   └── unit/
│       └── client.test.ts
├── docs/plans/
├── package.json
├── tsconfig.json
├── CLAUDE.md
└── README.md
```

### Lark HTTP Client (`src/client.ts`)

The sole HTTP interface to Lark APIs. All commands go through this module.

**Token management:**
- Reads `LARK_APP_ID` + `LARK_APP_SECRET` from env
- Fetches `tenant_access_token` via `POST /auth/v3/tenant_access_token/internal`
- Module-level cache (one token fetch per CLI invocation — tokens last 2 hours)
- No refresh logic needed (CLI invocations are short-lived)

**HTTP methods:**
- `get<T>(path, query?)` — GET with query params
- `post<T>(path, body?)` — POST with JSON body
- `put<T>(path, body?)` — PUT with JSON body
- `patch<T>(path, body?)` — PATCH with JSON body
- `delete<T>(path, body?)` — DELETE with optional body
- `downloadBinary(path, outputPath)` — stream binary to file
- `uploadFile(path, filePath, meta?)` — multipart upload via FormData

**Response handling:**
- Lark APIs return `{ code, msg, data }` envelope
- `code === 0` → return `data`
- `code !== 0` → throw with code and message

### CLI Entry (`src/cli.ts`)

Minimal subcommand router using `process.argv`:

```
lark-cli <module> <command> [args...] [--flags]
```

- Parses module name → loads command file
- Parses command name → invokes handler
- Handles `--stdin` flag for piped JSON input
- Wraps all handlers in try/catch for uniform error output

### Command Files (`src/commands/*.ts`)

Each file exports a `register()` function that returns a map of command names to handlers:

```typescript
export function register(client: LarkClient) {
  return {
    'list-records': async (args: string[], flags: Record<string, string>) => { ... },
    'add-records': async (args: string[], flags: Record<string, string>) => { ... },
  };
}
```

Handler contract:
- Receives positional args (string[]) and parsed flags (Record<string, string>)
- Returns any JSON-serializable value (written to stdout by cli.ts)
- Throws on error (caught by cli.ts, formatted to stderr)

## Command Reference

### doc (8 commands)

| Command | Args | Description |
|---------|------|-------------|
| `get` | `<documentId>` | Get document title + raw text content |
| `get-blocks` | `<documentId> [--block-id ID]` | Get document block structure |
| `create` | `[--title T] [--folder TOKEN]` | Create new document |
| `insert` | `<documentId> <blockId> <markdown>` | Convert markdown to blocks and insert |
| `update` | `<documentId> <blockId> <actionsJson>` | Update block content |
| `delete` | `<documentId> <blockId> <startIdx> <endIdx>` | Delete child blocks by index range |
| `create-block` | `<documentId> <blockId> <blocksJson>` | Create raw block structures |
| `download` | `<documentId> [--type docx\|pdf] [--output DIR]` | Download document as file |

### wiki (4 commands)

| Command | Args | Description |
|---------|------|-------------|
| `get-space` | `<spaceId>` | Get wiki space info |
| `get-node` | `<token>` | Get node by token |
| `list-nodes` | `<spaceId> [--parent TOKEN]` | List child nodes |
| `create-node` | `<spaceId> <objType> <objToken> [--parent TOKEN]` | Create wiki node |

### chat (4 commands)

| Command | Args | Description |
|---------|------|-------------|
| `history` | `<chatId> [--count N] [--start-time T]` | Get chat history |
| `members` | `<chatId>` | Get chat member list |
| `create` | `<name> [--user-ids IDs]` | Create group chat |
| `add-members` | `<chatId> <idList>` | Add members to chat |

### bitable (12 commands)

| Command | Args | Description |
|---------|------|-------------|
| `create-app` | `[--name N] [--folder TOKEN]` | Create Bitable app |
| `create-tables` | `<appToken> <tablesJson>` | Batch create tables |
| `delete-tables` | `<appToken> <tableIds>` | Batch delete tables |
| `list-fields` | `<appToken> <tableId>` | List table schema/fields |
| `add-records` | `<appToken> <tableId> <recordsJson>` | Batch add records |
| `delete-records` | `<appToken> <tableId> <recordIds>` | Batch delete records |
| `list-records` | `<appToken> <tableId> [--filter F] [--page-size N]` | Query records |
| `update-records` | `<appToken> <tableId> <recordsJson>` | Batch update records |
| `create-field` | `<appToken> <tableId> <fieldJson>` | Create field |
| `update-field` | `<appToken> <tableId> <fieldId> <fieldJson>` | Update field |
| `delete-field` | `<appToken> <tableId> <fieldId>` | Delete field |
| `transfer-owner` | `<appToken> <memberType> <memberId>` | Transfer ownership |

### sheets (14 commands)

| Command | Args | Description |
|---------|------|-------------|
| `create` | `[--title T] [--folder TOKEN]` | Create spreadsheet |
| `metadata` | `<token>` | Get spreadsheet metadata |
| `read` | `<token> <range> [--render OPT]` | Read data from range |
| `write` | `<token> <range> <valuesJson>` | Write data to range |
| `append` | `<token> <range> <valuesJson>` | Append rows |
| `prepend` | `<token> <range> <valuesJson>` | Prepend rows |
| `add-sheet` | `<token> <title> [--rows N] [--cols N]` | Add worksheet |
| `delete-sheet` | `<token> <sheetId>` | Delete worksheet |
| `update-sheet` | `<token> <sheetId> [--title T] [--index N]` | Update worksheet |
| `add-dimension` | `<token> <sheetId> <ROWS\|COLUMNS> <length>` | Add rows/columns |
| `delete-dimension` | `<token> <sheetId> <ROWS\|COLUMNS> <start> <end>` | Delete rows/columns |
| `find` | `<token> <sheetId> <value>` | Find matching cells |
| `replace` | `<token> <sheetId> <find> <replacement>` | Find and replace |
| `transfer-owner` | `<token> <memberType> <memberId>` | Transfer ownership |

### drive (6 commands)

| Command | Args | Description |
|---------|------|-------------|
| `update-permission` | `<token> <type> <memberId> <perm>` | Update collaborator permission |
| `transfer-owner` | `<token> <type> <memberType> <memberId>` | Transfer document ownership |
| `upload` | `<filePath> [--parent TOKEN]` | Upload file to Drive |
| `download-image` | `<imageKey> <outputPath>` | Download bot-uploaded image |
| `download-file` | `<fileKey> <outputPath>` | Download bot-uploaded file |
| `download-message-resource` | `<msgId> <fileKey> <outputPath>` | Download message resource |

## E2E Testing

### Strategy

Each module has a dedicated E2E test file. Tests are self-contained:

1. **beforeAll**: create test resources (documents, tables, etc.)
2. **test cases**: exercise CRUD operations
3. **afterAll**: delete all created resources (runs even on failure)

### Credential management

- Read from `LARK_APP_ID` + `LARK_APP_SECRET` env vars
- Local dev: `.env` file (gitignored)
- CI: GitHub Secrets
- Missing credentials → skip all E2E tests

### Test isolation

- Resource names include timestamps to avoid collision: `test-bitable-1710648000`
- Each module's tests are independent (no cross-module resource sharing)
- Cleanup is best-effort (log failures but don't fail the suite)

### Example flow (bitable)

```
beforeAll:
  → create test Bitable app
  → create test table with fields

tests:
  → add-records → verify data
  → list-records with filter → verify results
  → update-records → verify changes
  → delete-records → verify removal

afterAll:
  → delete the entire Bitable app (cascades tables/records)
```

## Migration from Stella

After this CLI is published, Stella will:

1. Create thin skill wrappers that invoke `npx @mission-ai/lark-cli`
2. Remove `bitable-mcp-server.ts`, `sheets-mcp-server.ts`
3. Remove docx/wiki/chat/permission/media tools from `lark-mcp-server.ts`
4. Remove the now-empty `lark-mcp-server.ts` if all tools are migrated

This migration is out of scope for this project — tracked separately in Stella.
