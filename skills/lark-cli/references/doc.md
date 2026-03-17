# doc Module Reference

## get

Get document title, revision, and raw text content.

```bash
npx @mission-ai/lark-cli doc get <documentId>
```

**Args:**
- `documentId` — Document ID (from URL or API)

**Output:** `{ title, revision_id, content }`

## get-blocks

Get the block tree of a document, or children of a specific block.

```bash
npx @mission-ai/lark-cli doc get-blocks <documentId> [--block-id BLOCK_ID]
```

**Args:**
- `documentId` — Document ID

**Flags:**
- `--block-id` — (optional) If provided, returns children of this block instead of the full tree

**Output:** Block tree with nested `children`

## create

Create a new empty document.

```bash
npx @mission-ai/lark-cli doc create [--title TITLE] [--folder FOLDER_TOKEN]
```

**Flags:**
- `--title` — Document title
- `--folder` — Folder token to create in

**Output:** `{ document: { document_id, title, ... } }`

## insert

Insert markdown content into a document at a specific block position.

```bash
npx @mission-ai/lark-cli doc insert <documentId> <blockId> <markdown>
```

**Args:**
- `documentId` — Document ID
- `blockId` — Target block ID (content is inserted as descendants)
- `markdown` — Markdown string to convert and insert

**How it works:** Converts markdown → blocks via Lark API, then inserts as descendants.

**Output:** `{ inserted_blocks: <count> }`

## update

Update a block's properties.

```bash
npx @mission-ai/lark-cli doc update <documentId> <blockId> <actionsJson>
```

**Args:**
- `documentId` — Document ID
- `blockId` — Block to update
- `actionsJson` — JSON string with update actions (see Lark API docs for block update format)

## delete

Delete child blocks within a range.

```bash
npx @mission-ai/lark-cli doc delete <documentId> <blockId> <startIndex> <endIndex>
```

**Args:**
- `documentId` — Document ID
- `blockId` — Parent block ID
- `startIndex` — Start index of children to delete (inclusive)
- `endIndex` — End index (exclusive)

## create-block

Insert raw block JSON as children of a block.

```bash
npx @mission-ai/lark-cli doc create-block <documentId> <blockId> <blocksJson>
```

**Args:**
- `documentId` — Document ID
- `blockId` — Parent block
- `blocksJson` — JSON array of block objects

## download

Export document to a local file.

```bash
npx @mission-ai/lark-cli doc download <documentId> [--output DIR] [--type FORMAT]
```

**Args:**
- `documentId` — Document ID

**Flags:**
- `--output` — Output directory (default: `.`)
- `--type` — File format: `docx`, `pdf`, `md` (default: `docx`)

**How it works:** Creates an export task, polls until complete, downloads the file.

**Output:** `{ file: "<path>" }`
