# @mission-ai/lark-cli

Standalone Lark Open API CLI tool designed for AI Agents.

## Project Purpose

A general-purpose Lark CLI wrapper around Feishu/Lark Open Platform APIs. Zero coupling with any business framework. Can be invoked via bash by any AI Agent or automation tool.

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
    ├── permission.ts      ← shared permission commands factory (5 commands per module)
    ├── doc.ts             ← cloud documents (13 commands)
    ├── wiki.ts            ← knowledge base (9 commands)
    ├── chat.ts            ← group chat (4 commands)
    ├── bitable.ts         ← multi-dimensional tables (16 commands)
    ├── sheets.ts          ← spreadsheets (18 commands)
    ├── drive.ts           ← file upload/download + permissions (9 commands)
    └── calendar.ts        ← calendar & event management (24 commands)
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
LARK_TEST_OPEN_ID  # optional — open_id for permission E2E tests
LARK_WIKI_NODE_TOKEN # optional — wiki node token for wiki permission E2E tests
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
| `doc` | 13 | Cloud document CRUD + download + permissions |
| `wiki` | 9 | Knowledge base node management + permissions |
| `chat` | 4 | Chat history/members/creation |
| `bitable` | 16 | Multi-dimensional table operations + permissions |
| `sheets` | 18 | Spreadsheet read/write + permissions |
| `drive` | 9 | File upload/download + permissions |
| `calendar` | 24 | Calendar & event management |

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
- Commit messages follow Conventional Commits: `type: description`

## CI/CD

- **CI**: push/PR to main → build + unit test (GitHub Actions)
- **Release**: push `v*` tag → build + test + npm publish + GitHub Release

## Release Process

When the user asks to release a new version, follow these steps:

### 1. Pre-release checks

```bash
bun run build && bun test tests/unit/
```

Both must pass before proceeding.

### 2. Determine version bump

- **patch** (0.1.0 → 0.1.1): bug fixes, minor tweaks
- **minor** (0.1.0 → 0.2.0): new commands, new modules, non-breaking features
- **major** (0.1.0 → 1.0.0): breaking changes to CLI interface or output format

If unclear, ask the user which bump to use.

### 3. Write changelog entry

Review commits since last tag to generate the changelog:

```bash
git log $(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)..HEAD --oneline
```

Group changes into these categories (omit empty categories):

```
### New Features
- **module**: description

### Bug Fixes
- **module**: description

### Other Changes
- description
```

Rules:
- Each line maps to one or more commits, written in user-facing language (not commit messages verbatim)
- Prefix with the affected module in bold when applicable (e.g., `**calendar**:`)
- Keep descriptions concise — one line per item

### 4. Bump version and tag

```bash
npm version <patch|minor|major>
```

This updates `package.json`, creates a git commit and tag automatically.

### 5. Push to trigger release

```bash
git push --follow-tags
```

This triggers the release workflow which will:
- Build and test
- Publish to npm (`@mission-ai/lark-cli`)
- Create a GitHub Release with auto-generated release notes

### 6. Verify

After pushing, remind the user to check:
- GitHub Actions tab for workflow status
- npm: `npm view @mission-ai/lark-cli version`
