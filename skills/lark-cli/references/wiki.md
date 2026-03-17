# wiki Module Reference

## get-space

Get wiki space information.

```bash
npx @mission-ai/lark-cli wiki get-space <spaceId>
```

**Args:**
- `spaceId` — Wiki space ID

**Output:** Space metadata (name, description, visibility)

## get-node

Get a wiki node by its token.

```bash
npx @mission-ai/lark-cli wiki get-node <token>
```

**Args:**
- `token` — Node token (the `obj_token` of the wiki node)

**Output:** Node info including type, title, parent

## list-nodes

List child nodes in a wiki space.

```bash
npx @mission-ai/lark-cli wiki list-nodes <spaceId> [--parent PARENT_TOKEN] [--page-token T] [--page-size N]
```

**Args:**
- `spaceId` — Wiki space ID

**Flags:**
- `--parent` — Parent node token (omit for root level)
- `--page-token` — Pagination token
- `--page-size` — Page size

**Output:** `{ items: [...], page_token, has_more }`

## create-node

Add an existing document to a wiki space.

```bash
npx @mission-ai/lark-cli wiki create-node <spaceId> <objType> <objToken> [--parent PARENT_TOKEN] [--title TITLE]
```

**Args:**
- `spaceId` — Wiki space ID
- `objType` — Object type: `docx`, `sheet`, `bitable`, etc.
- `objToken` — Token of the existing document

**Flags:**
- `--parent` — Parent node token
- `--title` — Display title in wiki

**Output:** Created node info
