import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { LarkClient } from '../client.js';
import type { CommandMap } from '../types.js';
import { createPermissionCommands } from './permission.js';

function stripMergeInfo(blocks: any[]): any[] {
  return blocks.map((block) => {
    const cleaned = { ...block };
    delete cleaned.merge_info;
    if (Array.isArray(cleaned.children)) {
      cleaned.children = stripMergeInfo(cleaned.children);
    }
    if (Array.isArray(cleaned.blocks)) {
      cleaned.blocks = stripMergeInfo(cleaned.blocks);
    }
    return cleaned;
  });
}

export function register(client: LarkClient): CommandMap {
  return {
    ...createPermissionCommands(client, 'docx'),

    'get': async (args, _flags) => {
      const [documentId] = args;
      const [docInfo, rawContent] = await Promise.all([
        client.get<{ document: { title: string; revision_id: number } }>(
          `/docx/v1/documents/${documentId}`,
        ),
        client.get<{ content: string }>(
          `/docx/v1/documents/${documentId}/raw_content`,
        ),
      ]);
      return {
        title: docInfo.document.title,
        revision_id: docInfo.document.revision_id,
        content: rawContent.content,
      };
    },

    'get-blocks': async (args, flags) => {
      const [documentId] = args;
      const blockId = flags['block-id'];
      const path = blockId
        ? `/docx/v1/documents/${documentId}/blocks/${blockId}/children`
        : `/docx/v1/documents/${documentId}/blocks`;
      return client.get(path);
    },

    'create': async (_args, flags) => {
      return client.post('/docx/v1/documents', {
        title: flags.title,
        folder_token: flags.folder,
      });
    },

    'insert': async (args, _flags) => {
      const [documentId, blockId, markdown] = args;
      // Step 1: Convert markdown to blocks
      const convertResult = await client.post<{
        blocks: any[];
        first_level_block_ids: string[];
      }>('/docx/v1/documents/blocks/convert', {
        content_type: 'markdown',
        content: markdown,
      });

      // Step 2: Strip merge_info (read-only field)
      const cleanedBlocks = stripMergeInfo(convertResult.blocks);

      // Step 3: Insert using descendant API
      await client.post(
        `/docx/v1/documents/${documentId}/blocks/${blockId}/descendant`,
        {
          children_id: convertResult.first_level_block_ids,
          descendants: cleanedBlocks,
        },
      );

      return {
        inserted_blocks: convertResult.first_level_block_ids.length,
      };
    },

    'update': async (args, _flags) => {
      const [documentId, blockId, actionsJson] = args;
      const updateBody = JSON.parse(actionsJson);
      return client.patch(
        `/docx/v1/documents/${documentId}/blocks/${blockId}`,
        updateBody,
      );
    },

    'delete': async (args, _flags) => {
      const [documentId, blockId, startIdx, endIdx] = args;
      return client.delete(
        `/docx/v1/documents/${documentId}/blocks/${blockId}/children/batch_delete`,
        {
          start_index: Number(startIdx),
          end_index: Number(endIdx),
        },
      );
    },

    'create-block': async (args, _flags) => {
      const [documentId, blockId, blocksJson] = args;
      const children = JSON.parse(blocksJson);
      return client.post(
        `/docx/v1/documents/${documentId}/blocks/${blockId}/children?document_revision_id=-1`,
        { children },
      );
    },

    'download': async (args, flags) => {
      const [documentId] = args;
      const outputDir = flags.output || '.';
      const fileType = flags.type || 'docx';

      await mkdir(outputDir, { recursive: true });

      // Create export task
      const task = await client.post<{ ticket: string }>(
        '/drive/v1/export_tasks',
        {
          file_extension: fileType,
          token: documentId,
          type: 'docx',
        },
      );

      // Poll until complete
      let result: any;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        result = await client.get(
          `/drive/v1/export_tasks/${task.ticket}`,
          { token: documentId },
        );
        if (result.result?.file_token) break;
      }

      if (!result?.result?.file_token) {
        throw new Error('Export task timed out');
      }

      // Download
      const outputPath = join(outputDir, `${result.result.file_name}`);
      await client.downloadBinary(
        `/drive/v1/export_tasks/file/${result.result.file_token}/download`,
        outputPath,
      );

      return { file: outputPath };
    },
  };
}
