# @mission-ai/lark-cli

A standalone CLI tool for the [Lark Open Platform](https://open.larksuite.com/) API, designed for AI Agent consumption.

## Install

```bash
npm install -g @mission-ai/lark-cli
# or
npx @mission-ai/lark-cli <module> <command> [args...]
```

## Setup

Set your Lark app credentials as environment variables:

```bash
export LARK_APP_ID=cli_xxx
export LARK_APP_SECRET=xxx
```

Optionally override the base URL (defaults to `https://open.larksuite.com/open-apis`):

```bash
export LARK_BASE_URL=https://open.feishu.cn/open-apis  # for China region
```

## Usage

```bash
lark-cli <module> <command> [positional-args...] [--option value]
```

All output is JSON. Success writes to stdout (exit 0), failure writes to stderr (exit 1).

### Complex JSON arguments

For commands that accept JSON data (records, blocks, etc.), pass as a positional argument:

```bash
lark-cli bitable add-records <appToken> <tableId> '[{"fields":{"Name":"Alice"}}]'
```

Or pipe via stdin with `--stdin`:

```bash
echo '[{"fields":{"Name":"Alice"}}]' | lark-cli bitable add-records <appToken> <tableId> --stdin
```

## Modules

### doc — Cloud Documents

```bash
lark-cli doc get <documentId>
lark-cli doc get-blocks <documentId> [--block-id <blockId>]
lark-cli doc create [--title <title>] [--folder <folderToken>]
lark-cli doc insert <documentId> <blockId> <markdown>
lark-cli doc update <documentId> <blockId> <actionsJson>
lark-cli doc delete <documentId> <blockId> <startIndex> <endIndex>
lark-cli doc create-block <documentId> <blockId> <blocksJson>
lark-cli doc download <documentId> [--type docx|pdf] [--output <dir>]
```

### wiki — Knowledge Base

```bash
lark-cli wiki get-space <spaceId>
lark-cli wiki get-node <token>
lark-cli wiki list-nodes <spaceId> [--parent <parentToken>]
lark-cli wiki create-node <spaceId> <objType> <objToken> [--parent <parentToken>]
```

### chat — Group Chat

```bash
lark-cli chat history <chatId> [--count <n>] [--start-time <timestamp>]
lark-cli chat members <chatId>
lark-cli chat create <name> [--user-ids <id1,id2,...>]
lark-cli chat add-members <chatId> <idList>
```

### bitable — Multi-dimensional Tables

```bash
lark-cli bitable create-app [--name <name>] [--folder <folderToken>]
lark-cli bitable create-tables <appToken> <tablesJson>
lark-cli bitable delete-tables <appToken> <tableIds>
lark-cli bitable list-fields <appToken> <tableId>
lark-cli bitable add-records <appToken> <tableId> <recordsJson>
lark-cli bitable delete-records <appToken> <tableId> <recordIds>
lark-cli bitable list-records <appToken> <tableId> [--filter <expr>] [--page-size <n>]
lark-cli bitable update-records <appToken> <tableId> <recordsJson>
lark-cli bitable create-field <appToken> <tableId> <fieldJson>
lark-cli bitable update-field <appToken> <tableId> <fieldId> <fieldJson>
lark-cli bitable delete-field <appToken> <tableId> <fieldId>
lark-cli bitable transfer-owner <appToken> <memberType> <memberId>
```

### sheets — Spreadsheets

```bash
lark-cli sheets create [--title <title>] [--folder <folderToken>]
lark-cli sheets metadata <spreadsheetToken>
lark-cli sheets read <spreadsheetToken> <range> [--render <option>]
lark-cli sheets write <spreadsheetToken> <range> <valuesJson>
lark-cli sheets append <spreadsheetToken> <range> <valuesJson>
lark-cli sheets prepend <spreadsheetToken> <range> <valuesJson>
lark-cli sheets add-sheet <spreadsheetToken> <title> [--rows <n>] [--cols <n>]
lark-cli sheets delete-sheet <spreadsheetToken> <sheetId>
lark-cli sheets update-sheet <spreadsheetToken> <sheetId> [--title <t>] [--index <n>]
lark-cli sheets add-dimension <spreadsheetToken> <sheetId> <ROWS|COLUMNS> <length>
lark-cli sheets delete-dimension <spreadsheetToken> <sheetId> <ROWS|COLUMNS> <start> <end>
lark-cli sheets find <spreadsheetToken> <sheetId> <value>
lark-cli sheets replace <spreadsheetToken> <sheetId> <find> <replacement>
lark-cli sheets transfer-owner <spreadsheetToken> <memberType> <memberId>
```

### drive — Permissions & Media

```bash
lark-cli drive update-permission <token> <type> <memberId> <perm>
lark-cli drive transfer-owner <token> <type> <memberType> <memberId>
lark-cli drive upload <filePath> [--parent <folderToken>]
lark-cli drive download-image <imageKey> <outputPath>
lark-cli drive download-file <fileKey> <outputPath>
lark-cli drive download-message-resource <messageId> <fileKey> <outputPath>
```

## Output Format

### Success (exit code 0)

Stdout contains the `data` field from the Lark API response as JSON:

```json
{
  "document": {
    "document_id": "abc123",
    "title": "My Document"
  }
}
```

### Error (exit code 1)

Stderr contains a JSON error object:

```json
{
  "error": "Document not found",
  "code": 1120100
}
```

## Development

```bash
# install dependencies
bun install

# run in dev mode
bun run src/cli.ts doc get <id>

# build
bun run build

# run unit tests
bun test

# run E2E tests (requires Lark credentials)
LARK_APP_ID=xxx LARK_APP_SECRET=xxx bun run test:e2e
```

## License

MIT
