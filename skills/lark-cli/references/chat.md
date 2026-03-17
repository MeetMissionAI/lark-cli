# chat Module Reference

## create

Create a new group chat.

```bash
npx @mission-ai/lark-cli chat create [name] [--description DESC] [--user-ids ID1,ID2,...]
```

**Args:**
- `name` — (optional) Chat name

**Flags:**
- `--description` — Chat description
- `--user-ids` — Comma-separated open_ids of initial members

**Output:** `{ chat_id, ... }`

## members

List members of a chat.

```bash
npx @mission-ai/lark-cli chat members <chatId> [--page-size N] [--page-token T]
```

**Args:**
- `chatId` — Chat ID

**Flags:**
- `--page-size` — Page size
- `--page-token` — Pagination token

**Output:** `{ items: [{ member_id, name, ... }], page_token, has_more }`

Uses `open_id` as the member ID type.

## history

Get message history of a chat.

```bash
npx @mission-ai/lark-cli chat history <chatId> [--count N] [--start-time TS] [--end-time TS] [--page-token T] [--sort TYPE]
```

**Args:**
- `chatId` — Chat ID

**Flags:**
- `--count` — Number of messages per page
- `--start-time` — Start timestamp (Unix seconds)
- `--end-time` — End timestamp
- `--page-token` — Pagination token
- `--sort` — Sort type: `ByCreateTimeAsc` or `ByCreateTimeDesc`

**Output:** `{ items: [{ message_id, msg_type, body, ... }], page_token, has_more }`

## add-members

Add members to an existing chat.

```bash
npx @mission-ai/lark-cli chat add-members <chatId> <openId1> [openId2] [...]
```

**Args:**
- `chatId` — Chat ID
- Remaining args — open_id values of users to add

**Output:** Confirmation with any invalid IDs noted
