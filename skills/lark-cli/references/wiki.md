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

## list-children

List child nodes of a specific parent node in a wiki space (paginated).

```bash
npx @mission-ai/lark-cli wiki list-children <spaceId> <parentNodeToken> [--page-token T] [--page-size N]
```

**Args:**
- `spaceId` — Wiki space ID
- `parentNodeToken` — Parent node token

**Flags:**
- `--page-token` — Pagination token
- `--page-size` — Page size (max 50)

**Output:** `{ items: [...], page_token, has_more }`

## move-node

Move a wiki node to a different parent or space. Moves child nodes together.

```bash
npx @mission-ai/lark-cli wiki move-node <spaceId> <nodeToken> [--target-parent-token TOKEN] [--target-space-id ID]
```

**Args:**
- `spaceId` — Source wiki space ID
- `nodeToken` — Node token to move

**Flags:**
- `--target-parent-token` — Destination parent node token
- `--target-space-id` — Destination wiki space ID (for cross-space moves)

**Output:** Moved node info

## update-title

Update the title of a wiki node. Supports doc, docx, and shortcut nodes only.

```bash
npx @mission-ai/lark-cli wiki update-title <spaceId> <nodeToken> <title>
```

**Args:**
- `spaceId` — Wiki space ID
- `nodeToken` — Node token
- `title` — New title

**Output:** `{}`
