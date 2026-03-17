# drive Module Reference

Manage file permissions and handle media upload/download.

## update-permission

Update a member's permission on a file.

```bash
npx @mission-ai/lark-cli drive update-permission <token> <type> <memberId> <perm>
```

**Args:**
- `token` — File token
- `type` — File type: `doc`, `docx`, `sheet`, `bitable`, `file`, etc.
- `memberId` — Member's open_id
- `perm` — Permission level: `view`, `edit`, `full_access`

## transfer-owner

Transfer file ownership.

```bash
npx @mission-ai/lark-cli drive transfer-owner <token> <type> <memberType> <memberId>
```

**Args:**
- `token` — File token
- `type` — File type
- `memberType` — `openid`, `userid`, etc.
- `memberId` — New owner's ID

## upload

Upload a local file to Lark Drive.

```bash
npx @mission-ai/lark-cli drive upload <filePath> [--parent FOLDER_TOKEN]
```

**Args:**
- `filePath` — Local file path

**Flags:**
- `--parent` — Parent folder token in Drive

**Output:** `{ file_token, ... }`

Note: File name is derived from the local file path. Max file size depends on Lark plan.

## download-image

Download an image by its image key.

```bash
npx @mission-ai/lark-cli drive download-image <imageKey> <outputPath>
```

**Args:**
- `imageKey` — Image key (from message or document)
- `outputPath` — Local path to save the image

**Output:** `{ file: "<outputPath>" }`

## download-file

Download a file by its file key.

```bash
npx @mission-ai/lark-cli drive download-file <fileKey> <outputPath>
```

**Args:**
- `fileKey` — File key (from message)
- `outputPath` — Local path to save

**Output:** `{ file: "<outputPath>" }`

## download-message-resource

Download an attachment from a message.

```bash
npx @mission-ai/lark-cli drive download-message-resource <messageId> <fileKey> <outputPath>
```

**Args:**
- `messageId` — Message ID containing the attachment
- `fileKey` — Resource file key
- `outputPath` — Local path to save

**Output:** `{ file: "<outputPath>" }`
