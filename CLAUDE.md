# @mission-ai/lark-cli

Standalone Lark Open API CLI tool designed for AI Agents.

## Project Purpose

A general-purpose Lark CLI wrapper around Feishu/Lark Open Platform APIs. Zero coupling with any business framework (NestJS, Stella, etc.). Can be invoked via bash by any Agent (Claude Code, Stella, or others).

## Tech Stack

| Category | Choice |
|----------|--------|
| Language | TypeScript 5.7 |
| Runtime | Node.js >= 18 (native fetch) |
| Package Manager | bun |
| Test Runner | bun test |
| Build | tsc → ESM |
| External Dependencies | Zero |

## Directory Structure

```
src/
├── cli.ts                 ← bin entry, subcommand routing
├── client.ts              ← Lark HTTP client (token + request)
├── types.ts               ← shared type definitions
└── commands/
    ├── doc.ts             ← cloud documents (8 commands)
    ├── wiki.ts            ← knowledge base (4 commands)
    ├── chat.ts            ← group chat (4 commands)
    ├── bitable.ts         ← multi-dimensional tables (12 commands)
    ├── sheets.ts          ← spreadsheets (14 commands)
    └── drive.ts           ← permissions & media (6 commands)
tests/
├── e2e/                   ← E2E tests (require real Lark credentials)
└── unit/                  ← unit tests (mock fetch)
```

## Common Commands

```bash
bun install                # install dependencies
bun run build              # tsc compile to dist/
bun test                   # run unit tests
bun run test:e2e           # run E2E tests (requires env vars)
```

## Environment Variables

```bash
LARK_APP_ID        # required — Lark app ID
LARK_APP_SECRET    # required — Lark app secret
LARK_BASE_URL      # optional — API base URL (default: https://open.larksuite.com/open-apis)
```

## CLI Invocation

```bash
lark-cli <module> <command> [positional-args...] [--option value]
```

- Success: stdout outputs JSON (the `data` field from Lark API response), exit code 0
- Failure: stderr outputs `{"error": "message", "code": 12345}`, exit code 1

## Modules

| Module | Commands | Description |
|--------|----------|-------------|
| `doc` | 8 | Cloud document CRUD + download |
| `wiki` | 4 | Knowledge base node management |
| `chat` | 4 | Chat history/members/creation |
| `bitable` | 12 | Multi-dimensional table operations |
| `sheets` | 14 | Spreadsheet read/write |
| `drive` | 6 | Permissions + file upload/download |

## Design Principles

- **Zero coupling**: no dependency on any external framework or business code
- **Zero external dependencies**: only Node.js built-in APIs (native fetch, node:fs, etc.)
- **Agent-first**: all output is JSON, no interactive prompts
- **Testable**: every module has corresponding E2E tests

## E2E Testing

- Uses real Lark API credentials against real documents/tables
- Each test creates its own resources and cleans up after (setup/teardown)
- Automatically skipped when credentials are missing
- Run: `LARK_APP_ID=xxx LARK_APP_SECRET=xxx bun run test:e2e`

## Coding Conventions

- Single quotes, trailing commas
- ESM (import/export)
- Prefer functions over classes (except LarkClient)
- Each command file exports a `register(cli)` function
- Errors are caught at the command layer and formatted as JSON to stderr
