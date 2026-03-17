# sheets Module Reference

Lark Spreadsheets use these identifiers:
- **Spreadsheet token** (`token`) — Identifies the spreadsheet document
- **Sheet ID** (`sheetId`) — Identifies a worksheet tab within the spreadsheet
- **Range** — Format: `SheetId!A1:D10` or `SheetId!A:D`

## create

Create a new spreadsheet.

```bash
npx @mission-ai/lark-cli sheets create [--title TITLE] [--folder FOLDER_TOKEN]
```

**Flags:**
- `--title` — Spreadsheet title
- `--folder` — Folder token

**Output:** `{ spreadsheet: { spreadsheet_token, title, ... } }`

## metadata

Get spreadsheet metadata including all sheet tabs.

```bash
npx @mission-ai/lark-cli sheets metadata <token>
```

**Output:** `{ properties, sheets: [{ sheetId, title, index, rowCount, columnCount }] }`

## read

Read cell values from a range.

```bash
npx @mission-ai/lark-cli sheets read <token> <range> [--render OPTION] [--date-render OPTION]
```

**Args:**
- `token` — Spreadsheet token
- `range` — Range like `SheetId!A1:D10`

**Flags:**
- `--render` — Value render option: `ToString`, `FormattedValue`, `Formula`, `UnformattedValue`
- `--date-render` — Date render option: `FormattedString`

**Output:** `{ valueRange: { range, values: [[...], ...] } }`

## write

Write values to a range (overwrites existing data).

```bash
npx @mission-ai/lark-cli sheets write <token> <range> <valuesJson>
```

**Args:**
- `token` — Spreadsheet token
- `range` — Target range like `SheetId!A1:B2`
- `valuesJson` — 2D JSON array of values

**Example:**
```bash
npx @mission-ai/lark-cli sheets write TOKEN 'Sheet1!A1:B2' '[["Name","Age"],["Alice",30]]'
```

## append

Append rows after existing data in a range.

```bash
npx @mission-ai/lark-cli sheets append <token> <range> <valuesJson>
```

Same args as `write`. Data is appended below the last non-empty row in the range.

## prepend

Prepend rows before existing data.

```bash
npx @mission-ai/lark-cli sheets prepend <token> <range> <valuesJson>
```

Same args as `write`. Rows are inserted at the top of the range.

## add-sheet

Add a new worksheet tab.

```bash
npx @mission-ai/lark-cli sheets add-sheet <token> <title> [--rows N] [--cols N]
```

**Args:**
- `token` — Spreadsheet token
- `title` — New sheet title

**Flags:**
- `--rows` — Initial row count
- `--cols` — Initial column count

## delete-sheet

Delete a worksheet tab.

```bash
npx @mission-ai/lark-cli sheets delete-sheet <token> <sheetId>
```

## update-sheet

Update worksheet properties (title, position).

```bash
npx @mission-ai/lark-cli sheets update-sheet <token> <sheetId> [--title TITLE] [--index N]
```

## add-dimension

Add rows or columns.

```bash
npx @mission-ai/lark-cli sheets add-dimension <token> <sheetId> <majorDimension> <length>
```

**Args:**
- `majorDimension` — `ROWS` or `COLUMNS`
- `length` — Number of rows/columns to add

## delete-dimension

Delete rows or columns by index range.

```bash
npx @mission-ai/lark-cli sheets delete-dimension <token> <sheetId> <majorDimension> <startIndex> <endIndex>
```

**Args:**
- `majorDimension` — `ROWS` or `COLUMNS`
- `startIndex` — Start index (0-based, inclusive)
- `endIndex` — End index (exclusive)

## find

Search for a value in a sheet.

```bash
npx @mission-ai/lark-cli sheets find <token> <sheetId> <value> [--range RANGE]
```

**Flags:**
- `--range` — Limit search to a specific range

**Output:** Matched cell positions

## replace

Find and replace values.

```bash
npx @mission-ai/lark-cli sheets replace <token> <sheetId> <findValue> <replacement> [--range RANGE]
```

## transfer-owner

Transfer spreadsheet ownership.

```bash
npx @mission-ai/lark-cli sheets transfer-owner <token> <memberType> <memberId>
```
