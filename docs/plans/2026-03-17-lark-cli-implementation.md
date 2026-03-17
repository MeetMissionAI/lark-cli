# Lark CLI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a standalone Lark Open API CLI tool (`@mission-ai/lark-cli`) with 48 commands across 6 modules, each backed by E2E tests.

**Architecture:** Single TypeScript package with a minimal CLI router. `src/client.ts` handles all Lark HTTP communication (token + requests). Each module in `src/commands/` exports a `register()` function returning a command→handler map. `src/cli.ts` wires it all together.

**Tech Stack:** TypeScript 5.7, bun (package manager + test runner), tsc build, zero external deps, Node.js >= 18 native fetch.

---

## Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`

**Step 1: Create package.json**

```json
{
  "name": "@mission-ai/lark-cli",
  "version": "0.1.0",
  "description": "Standalone Lark Open API CLI for AI Agents",
  "type": "module",
  "bin": {
    "lark-cli": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "test": "bun test tests/unit/",
    "test:e2e": "bun test tests/e2e/"
  },
  "files": ["dist"],
  "license": "MIT"
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Step 3: Verify project builds**

Run: `cd /Users/jianfengliu/Documents/work/code/mission-ai/lark-cli && bun install`
Expected: Clean install, lockfile created.

**Step 4: Commit**

```bash
git add package.json tsconfig.json bun.lockb
git commit -m "chore: project scaffolding with package.json and tsconfig"
```

---

## Task 2: Lark HTTP client

**Files:**
- Create: `src/client.ts`
- Create: `src/types.ts`
- Create: `tests/unit/client.test.ts`

**Step 1: Create src/types.ts**

```typescript
export interface LarkResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

export class LarkApiError extends Error {
  constructor(
    public readonly code: number,
    message: string,
  ) {
    super(message);
    this.name = 'LarkApiError';
  }
}

export type CommandHandler = (
  args: string[],
  flags: Record<string, string>,
) => Promise<unknown>;

export type CommandMap = Record<string, CommandHandler>;
```

**Step 2: Create src/client.ts**

Port from Stella's `lark-token.service.ts` + `lark-api-client.service.ts`, stripping all NestJS decorators. Key behaviors:
- `getToken()` — POST to `/auth/v3/tenant_access_token/internal`, cache result
- `get/post/put/patch/delete` — attach Bearer token, unwrap `{code,msg,data}` envelope
- `downloadBinary(path, outputPath)` — stream to file via `node:fs`
- `uploadFile(path, filePath, meta)` — multipart FormData upload
- `request()` — internal method shared by all HTTP verbs

Reference: `stella/apps/server/src/lark-client/lark-api-client.service.ts` (lines 61-105 for `request()` pattern, lines 137-168 for `uploadImage()` pattern, lines 228-250 for `downloadBinary()` pattern).

```typescript
import { writeFile } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { LarkApiError } from './types.js';
import type { LarkResponse } from './types.js';

const DEFAULT_BASE_URL = 'https://open.larksuite.com/open-apis';

export class LarkClient {
  private token: string | null = null;
  private readonly baseUrl: string;
  private readonly appId: string;
  private readonly appSecret: string;

  constructor() {
    this.appId = process.env.LARK_APP_ID ?? '';
    this.appSecret = process.env.LARK_APP_SECRET ?? '';
    this.baseUrl = process.env.LARK_BASE_URL ?? DEFAULT_BASE_URL;

    if (!this.appId || !this.appSecret) {
      throw new Error('LARK_APP_ID and LARK_APP_SECRET must be set');
    }
  }

  async getToken(): Promise<string> {
    if (this.token) return this.token;

    const res = await fetch(
      `${this.baseUrl}/auth/v3/tenant_access_token/internal`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          app_id: this.appId,
          app_secret: this.appSecret,
        }),
      },
    );

    if (!res.ok) {
      throw new Error(`Token request failed: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as {
      code: number;
      msg: string;
      tenant_access_token: string;
      expire: number;
    };

    if (data.code !== 0) {
      throw new LarkApiError(data.code, `Token error: ${data.msg}`);
    }

    this.token = data.tenant_access_token;
    return this.token;
  }

  async get<T = any>(
    path: string,
    query?: Record<string, string | undefined>,
  ): Promise<T> {
    return this.request('GET', path, undefined, query);
  }

  async post<T = any>(path: string, body?: unknown): Promise<T> {
    return this.request('POST', path, body);
  }

  async put<T = any>(path: string, body?: unknown): Promise<T> {
    return this.request('PUT', path, body);
  }

  async patch<T = any>(path: string, body?: unknown): Promise<T> {
    return this.request('PATCH', path, body);
  }

  async delete<T = any>(path: string, body?: unknown): Promise<T> {
    return this.request('DELETE', path, body);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string | undefined>,
  ): Promise<T> {
    const token = await this.getToken();
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined) url.searchParams.set(k, v);
      }
    }

    const res = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      let detail = '';
      try {
        detail = ` — ${await res.text()}`;
      } catch {}
      throw new Error(`Lark API ${method} ${path} failed: ${res.status}${detail}`);
    }

    const json = (await res.json()) as LarkResponse<T>;
    if (json.code !== 0) {
      throw new LarkApiError(json.code, `Lark API error: ${json.msg}`);
    }

    return json.data;
  }

  async downloadBinary(path: string, outputPath: string): Promise<void> {
    const token = await this.getToken();
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Download failed: ${res.status}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(outputPath, buffer);
  }

  async uploadFile(
    path: string,
    filePath: string,
    fields: Record<string, string>,
  ): Promise<any> {
    const token = await this.getToken();
    const url = `${this.baseUrl}${path}`;
    const fileBuffer = await readFile(filePath);
    const formData = new FormData();

    for (const [k, v] of Object.entries(fields)) {
      formData.append(k, v);
    }
    formData.append('file', new Blob([fileBuffer]), basename(filePath));
    formData.append('size', String(fileBuffer.byteLength));

    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.status}`);
    }

    const json = (await res.json()) as LarkResponse;
    if (json.code !== 0) {
      throw new LarkApiError(json.code, `Upload error: ${json.msg}`);
    }

    return json.data;
  }

  /**
   * POST with Content-Type override (e.g., text/markdown for doc insert).
   */
  async postRaw<T = any>(
    path: string,
    body: string,
    contentType: string,
  ): Promise<T> {
    const token = await this.getToken();
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': contentType,
      },
      body,
    });

    if (!res.ok) {
      let detail = '';
      try {
        detail = ` — ${await res.text()}`;
      } catch {}
      throw new Error(`Lark API POST ${path} failed: ${res.status}${detail}`);
    }

    const json = (await res.json()) as LarkResponse<T>;
    if (json.code !== 0) {
      throw new LarkApiError(json.code, `Lark API error: ${json.msg}`);
    }

    return json.data;
  }
}
```

**Step 3: Write unit test for client**

```typescript
// tests/unit/client.test.ts
import { describe, test, expect, mock, beforeEach } from 'bun:test';
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
```

**Step 4: Run unit test**

Run: `cd /Users/jianfengliu/Documents/work/code/mission-ai/lark-cli && bun test tests/unit/`
Expected: 3 tests pass.

**Step 5: Commit**

```bash
git add src/types.ts src/client.ts tests/unit/client.test.ts
git commit -m "feat: add LarkClient HTTP client with token management"
```

---

## Task 3: CLI entry + arg parsing

**Files:**
- Create: `src/cli.ts`

**Step 1: Create src/cli.ts**

```typescript
#!/usr/bin/env node

import { LarkClient } from './client.js';
import type { CommandMap } from './types.js';

// Module registry — each import returns { register(client) => CommandMap }
const MODULE_LOADERS: Record<string, () => Promise<{ register: (client: LarkClient) => CommandMap }>> = {
  doc: () => import('./commands/doc.js'),
  wiki: () => import('./commands/wiki.js'),
  chat: () => import('./commands/chat.js'),
  bitable: () => import('./commands/bitable.js'),
  sheets: () => import('./commands/sheets.js'),
  drive: () => import('./commands/drive.js'),
};

function parseArgs(argv: string[]): {
  module: string;
  command: string;
  positional: string[];
  flags: Record<string, string>;
} {
  const [module, command, ...rest] = argv;
  const positional: string[] = [];
  const flags: Record<string, string> = {};

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = rest[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = 'true';
      }
    } else {
      positional.push(arg);
    }
  }

  return { module: module ?? '', command: command ?? '', positional, flags };
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

async function main() {
  const { module, command, positional, flags } = parseArgs(process.argv.slice(2));

  if (!module || !command) {
    const modules = Object.keys(MODULE_LOADERS).join(', ');
    process.stderr.write(
      JSON.stringify({ error: `Usage: lark-cli <module> <command> [args...]. Modules: ${modules}` }) + '\n',
    );
    process.exit(1);
  }

  const loader = MODULE_LOADERS[module];
  if (!loader) {
    process.stderr.write(
      JSON.stringify({ error: `Unknown module: ${module}. Available: ${Object.keys(MODULE_LOADERS).join(', ')}` }) + '\n',
    );
    process.exit(1);
  }

  // Handle --stdin flag: read JSON from stdin and append as last positional arg
  if (flags.stdin) {
    const stdinData = await readStdin();
    positional.push(stdinData.trim());
    delete flags.stdin;
  }

  try {
    const client = new LarkClient();
    const mod = await loader();
    const commands = mod.register(client);
    const handler = commands[command];

    if (!handler) {
      const available = Object.keys(commands).join(', ');
      process.stderr.write(
        JSON.stringify({ error: `Unknown command: ${module} ${command}. Available: ${available}` }) + '\n',
      );
      process.exit(1);
    }

    const result = await handler(positional, flags);
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } catch (err: any) {
    const output: Record<string, unknown> = { error: err.message };
    if ('code' in err) output.code = err.code;
    process.stderr.write(JSON.stringify(output) + '\n');
    process.exit(1);
  }
}

main();
```

**Step 2: Create stub command files (one per module)**

Create 6 stub files in `src/commands/` so the CLI can load them. Each looks like:

```typescript
// src/commands/bitable.ts (example — repeat pattern for doc, wiki, chat, sheets, drive)
import type { LarkClient } from '../client.js';
import type { CommandMap } from '../types.js';

export function register(client: LarkClient): CommandMap {
  return {};
}
```

**Step 3: Verify CLI boots and shows usage**

Run: `cd /Users/jianfengliu/Documents/work/code/mission-ai/lark-cli && bun run src/cli.ts 2>&1`
Expected: stderr JSON with usage message, exit code 1.

Run: `bun run src/cli.ts bitable nonexistent 2>&1`
Expected: stderr JSON with "Unknown command" error.

**Step 4: Commit**

```bash
git add src/cli.ts src/commands/
git commit -m "feat: add CLI entry with subcommand routing and module stubs"
```

---

## Task 4: E2E test infrastructure

**Files:**
- Create: `tests/e2e/setup.ts`

**Step 1: Create shared E2E setup**

```typescript
// tests/e2e/setup.ts
import { LarkClient } from '../../src/client.js';

export const hasCredentials = !!(process.env.LARK_APP_ID && process.env.LARK_APP_SECRET);

export function createClient(): LarkClient {
  return new LarkClient();
}

export function testId(): string {
  return `test-${Date.now()}`;
}
```

**Step 2: Commit**

```bash
git add tests/e2e/setup.ts
git commit -m "feat: add E2E test setup with credential check and helpers"
```

---

## Task 5: Bitable module + E2E

**Files:**
- Modify: `src/commands/bitable.ts`
- Create: `tests/e2e/bitable.e2e.test.ts`

**Step 1: Implement all 12 bitable commands**

Port handlers from Stella's `bitable-mcp-server.ts` (file: `stella/apps/server/src/claude/mcp/bitable-mcp-server.ts`). Strip the MCP `tool()` wrapper and `{content:[{type:'text',...}]}` return format — just return the raw API response data.

Each handler follows the pattern:
```typescript
'create-app': async (args, flags) => {
  const body: Record<string, string> = {};
  if (flags.name) body.name = flags.name;
  if (flags.folder) body.folder_token = flags.folder;
  return client.post('/bitable/v1/apps', body);
},
```

Reference API paths from `bitable-mcp-server.ts`:
- `POST /bitable/v1/apps` — create app
- `POST /bitable/v1/apps/{appToken}/tables/batch_create` — create tables
- `POST /bitable/v1/apps/{appToken}/tables/batch_delete` — delete tables
- `GET /bitable/v1/apps/{appToken}/tables/{tableId}/fields` — list fields
- `POST /bitable/v1/apps/{appToken}/tables/{tableId}/records/batch_create` — add records
- `POST /bitable/v1/apps/{appToken}/tables/{tableId}/records/batch_delete` — delete records
- `GET /bitable/v1/apps/{appToken}/tables/{tableId}/records` — list records
- `POST /bitable/v1/apps/{appToken}/tables/{tableId}/records/batch_update` — update records
- `POST /bitable/v1/apps/{appToken}/tables/{tableId}/fields` — create field
- `PUT /bitable/v1/apps/{appToken}/tables/{tableId}/fields/{fieldId}` — update field
- `DELETE /bitable/v1/apps/{appToken}/tables/{tableId}/fields/{fieldId}` — delete field
- `POST /drive/permission/member/transfer` — transfer owner (type: "bitable")

**Step 2: Write E2E test**

```typescript
// tests/e2e/bitable.e2e.test.ts
import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { hasCredentials, createClient, testId } from './setup.js';
import { register } from '../../src/commands/bitable.js';

describe.skipIf(!hasCredentials)('bitable E2E', () => {
  const client = createClient();
  const commands = register(client);
  let appToken: string;
  let tableId: string;

  beforeAll(async () => {
    // Create test bitable app
    const app = await commands['create-app']([], { name: testId() }) as any;
    appToken = app.app.app_token;
    tableId = app.app.default_table_id;
  });

  afterAll(async () => {
    // Bitable apps cannot be deleted via API — just leave it
    // (Lark has no delete app endpoint; manual cleanup may be needed)
  });

  test('list-fields returns fields', async () => {
    const result = await commands['list-fields']([appToken, tableId], {}) as any;
    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
  });

  test('create-field, update-field, delete-field lifecycle', async () => {
    // Create
    const fieldJson = JSON.stringify({ field_name: 'TestField', type: 1 });
    const created = await commands['create-field']([appToken, tableId, fieldJson], {}) as any;
    const fieldId = created.field.field_id;
    expect(fieldId).toBeDefined();

    // Update
    const updateJson = JSON.stringify({ field_name: 'UpdatedField', type: 1 });
    await commands['update-field']([appToken, tableId, fieldId, updateJson], {});

    // Delete
    await commands['delete-field']([appToken, tableId, fieldId], {});
  });

  test('add-records, list-records, update-records, delete-records lifecycle', async () => {
    // Add
    const records = JSON.stringify([{ fields: {} }]);
    const added = await commands['add-records']([appToken, tableId, records], {}) as any;
    const recordId = added.records[0].record_id;
    expect(recordId).toBeDefined();

    // List
    const listed = await commands['list-records']([appToken, tableId], {}) as any;
    expect(listed.items.length).toBeGreaterThan(0);

    // Update
    const updates = JSON.stringify([{ record_id: recordId, fields: {} }]);
    await commands['update-records']([appToken, tableId, updates], {});

    // Delete
    await commands['delete-records']([appToken, tableId, recordId], {});
  });
});
```

**Step 3: Run E2E test**

Run: `cd /Users/jianfengliu/Documents/work/code/mission-ai/lark-cli && LARK_APP_ID=$LARK_APP_ID LARK_APP_SECRET=$LARK_APP_SECRET bun test tests/e2e/bitable.e2e.test.ts`
Expected: All tests pass (or skip if no credentials).

**Step 4: Commit**

```bash
git add src/commands/bitable.ts tests/e2e/bitable.e2e.test.ts
git commit -m "feat: implement bitable module with 12 commands and E2E tests"
```

---

## Task 6: Sheets module + E2E

**Files:**
- Modify: `src/commands/sheets.ts`
- Create: `tests/e2e/sheets.e2e.test.ts`

**Step 1: Implement all 14 sheets commands**

Port from Stella's `sheets-mcp-server.ts`. Reference API paths:
- `POST /sheets/v3/spreadsheets` — create
- `GET /sheets/v2/spreadsheets/{token}/metainfo` — metadata
- `GET /sheets/v2/spreadsheets/{token}/values/{range}` — read range
- `PUT /sheets/v2/spreadsheets/{token}/values` — write range
- `POST /sheets/v2/spreadsheets/{token}/values_append` — append
- `POST /sheets/v2/spreadsheets/{token}/values_prepend` — prepend
- `POST /sheets/v2/spreadsheets/{token}/sheets_batch_update` — add/delete/update worksheet
- `POST /sheets/v2/spreadsheets/{token}/dimension_range` — add dimension
- `DELETE /sheets/v2/spreadsheets/{token}/dimension_range` — delete dimension
- `POST /sheets/v3/spreadsheets/{token}/sheets/{sheetId}/find` — find
- `POST /sheets/v3/spreadsheets/{token}/sheets/{sheetId}/replace` — replace
- `POST /drive/permission/member/transfer` — transfer owner (type: "sheet")

**Step 2: Write E2E test**

Test flow:
- `beforeAll`: create spreadsheet, get metadata to obtain sheetId
- Tests: write → read → append → find → replace → add-sheet → delete-sheet
- `afterAll`: no API to delete spreadsheets (leave for manual cleanup)

**Step 3: Run E2E, commit**

```bash
git add src/commands/sheets.ts tests/e2e/sheets.e2e.test.ts
git commit -m "feat: implement sheets module with 14 commands and E2E tests"
```

---

## Task 7: Doc module + E2E

**Files:**
- Modify: `src/commands/doc.ts`
- Create: `tests/e2e/doc.e2e.test.ts`

**Step 1: Implement all 8 doc commands**

Port from Stella's `lark-mcp-server.ts` docx handlers. Key nuances:
- `doc get` — calls two APIs in parallel: `/docx/v1/documents/{id}` + `/docx/v1/documents/{id}/raw_content`
- `doc insert` — uses `postRaw()` with `Content-Type: text/markdown` to `/docx/v1/documents/{id}/blocks/{blockId}/children`
- `doc create-block` — POST JSON to `/docx/v1/documents/{id}/blocks/{blockId}/children`
- `doc download` — POST to `/docx/v1/documents/{id}/tasks` (create export task), poll status, download file
- Include `stripMergeInfo()` utility from Stella's `lark-mcp-server.ts` (lines 12-26)

Reference API paths:
- `GET /docx/v1/documents/{id}` — get document info
- `GET /docx/v1/documents/{id}/raw_content` — get raw text
- `GET /docx/v1/documents/{id}/blocks` — list all blocks
- `GET /docx/v1/documents/{id}/blocks/{blockId}/children` — list block children
- `POST /docx/v1/documents` — create document
- `POST /docx/v1/documents/{id}/blocks/{blockId}/children` — insert blocks (JSON or markdown)
- `PATCH /docx/v1/documents/{id}/blocks/{blockId}` — update block
- `DELETE /docx/v1/documents/{id}/blocks/{blockId}/children/batch_delete` — delete blocks
- `POST /drive/v1/export_tasks` — create export task
- `GET /drive/v1/export_tasks/{ticket}` — poll export status
- `GET /drive/v1/export_tasks/file/{token}/download` — download exported file

**Step 2: Write E2E test**

Test flow:
- `beforeAll`: create a test document
- Tests: get → get-blocks → insert markdown → get-blocks again → verify block added
- `afterAll`: no delete API for docs

**Step 3: Run E2E, commit**

```bash
git add src/commands/doc.ts tests/e2e/doc.e2e.test.ts
git commit -m "feat: implement doc module with 8 commands and E2E tests"
```

---

## Task 8: Wiki module + E2E

**Files:**
- Modify: `src/commands/wiki.ts`
- Create: `tests/e2e/wiki.e2e.test.ts`

**Step 1: Implement all 4 wiki commands**

Reference API paths from Stella's `lark-mcp-server.ts`:
- `GET /wiki/v2/spaces/{spaceId}` — get space
- `GET /wiki/v2/spaces/get_node?token={token}` — get node
- `GET /wiki/v2/spaces/{spaceId}/nodes?parent_node_token={parent}` — list nodes
- `POST /wiki/v2/spaces/{spaceId}/nodes` — create node

**Step 2: Write E2E test**

Note: wiki tests need a pre-existing wiki space ID. Tests should:
- Skip if no `LARK_WIKI_SPACE_ID` env var is set
- `get-space` → verify space info returned
- `list-nodes` → verify array of nodes returned

**Step 3: Run E2E, commit**

```bash
git add src/commands/wiki.ts tests/e2e/wiki.e2e.test.ts
git commit -m "feat: implement wiki module with 4 commands and E2E tests"
```

---

## Task 9: Chat module + E2E

**Files:**
- Modify: `src/commands/chat.ts`
- Create: `tests/e2e/chat.e2e.test.ts`

**Step 1: Implement all 4 chat commands**

Reference API paths from Stella's `lark-mcp-server.ts`:
- `GET /im/v1/chats/{chatId}/messages` — chat history (with query params: page_size, start_time)
- `GET /im/v1/chats/{chatId}/members` — chat members
- `POST /im/v1/chats` — create chat
- `POST /im/v1/chats/{chatId}/members` — add members

**Step 2: Write E2E test**

Test flow:
- `beforeAll`: create a test chat group
- Tests: members → history → add-members (add bot itself by app bot open_id if available)
- `afterAll`: no explicit cleanup needed (empty test chats are harmless)

**Step 3: Run E2E, commit**

```bash
git add src/commands/chat.ts tests/e2e/chat.e2e.test.ts
git commit -m "feat: implement chat module with 4 commands and E2E tests"
```

---

## Task 10: Drive module + E2E

**Files:**
- Modify: `src/commands/drive.ts`
- Create: `tests/e2e/drive.e2e.test.ts`

**Step 1: Implement all 6 drive commands**

Reference API paths from Stella's `lark-mcp-server.ts`:
- `POST /drive/v1/permissions/{token}/members` + `PATCH` — update permission (need to look up exact path)
- `POST /drive/permission/member/transfer` — transfer owner
- `POST /drive/v1/medias/upload_all` — upload file (multipart, uses `client.uploadFile()`)
- `GET /im/v1/images/{imageKey}` — download image (uses `client.downloadBinary()`)
- `GET /im/v1/files/{fileKey}` — download file (uses `client.downloadBinary()`)
- `GET /im/v1/messages/{msgId}/resources/{fileKey}?type=image` — download message resource

**Step 2: Write E2E test**

Test flow: upload a small test file → verify token returned. Download tests may need a known image_key (skip if unavailable).

**Step 3: Run E2E, commit**

```bash
git add src/commands/drive.ts tests/e2e/drive.e2e.test.ts
git commit -m "feat: implement drive module with 6 commands and E2E tests"
```

---

## Task 11: Build verification + npm publish prep

**Files:**
- Modify: `package.json` (add publishConfig, keywords, etc.)

**Step 1: Run full build**

Run: `cd /Users/jianfengliu/Documents/work/code/mission-ai/lark-cli && bun run build`
Expected: `dist/` directory created with compiled JS files.

**Step 2: Test built CLI**

Run: `node dist/cli.js 2>&1`
Expected: Usage error in JSON format.

**Step 3: Run all unit tests**

Run: `bun test tests/unit/`
Expected: All pass.

**Step 4: Run all E2E tests**

Run: `LARK_APP_ID=$LARK_APP_ID LARK_APP_SECRET=$LARK_APP_SECRET bun run test:e2e`
Expected: All pass (or skip if no creds).

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: verify build and prepare for npm publish"
```

---

## Verification Checklist

After all tasks are complete:

1. `bun run build` — compiles without errors
2. `bun test` — unit tests pass
3. `bun run test:e2e` — E2E tests pass with real credentials
4. `node dist/cli.js bitable list-fields <appToken> <tableId>` — real invocation returns JSON
5. `node dist/cli.js nonexistent foo 2>&1` — returns JSON error on stderr
6. All 48 commands are implemented and have corresponding E2E coverage
