import type { LarkClient } from '../client.js';
import type { CommandMap } from '../types.js';

export function register(client: LarkClient): CommandMap {
  return {
    'update-permission': async (args, _flags) => {
      const [token, type, memberId, perm] = args;
      return client.put(
        `/drive/v1/permissions/${token}/members/${memberId}?type=${type}`,
        {
          member_type: 'openid',
          perm,
        },
      );
    },

    'transfer-owner': async (args, _flags) => {
      const [token, type, memberType, memberId] = args;
      return client.post('/drive/permission/member/transfer', {
        token,
        type,
        owner: {
          member_type: memberType,
          member_id: memberId,
        },
      });
    },

    'upload': async (args, flags) => {
      const [filePath] = args;
      const fields: Record<string, string> = {
        file_name: filePath.split('/').pop() || 'file',
        parent_type: 'explorer',
      };
      if (flags.parent) fields.parent_node = flags.parent;
      return client.uploadFile('/drive/v1/medias/upload_all', filePath, fields);
    },

    'download-image': async (args, _flags) => {
      const [imageKey, outputPath] = args;
      await client.downloadBinary(`/im/v1/images/${imageKey}`, outputPath);
      return { file: outputPath };
    },

    'download-file': async (args, _flags) => {
      const [fileKey, outputPath] = args;
      await client.downloadBinary(`/im/v1/files/${fileKey}`, outputPath);
      return { file: outputPath };
    },

    'download-message-resource': async (args, _flags) => {
      const [msgId, fileKey, outputPath] = args;
      await client.downloadBinary(
        `/im/v1/messages/${msgId}/resources/${fileKey}?type=image`,
        outputPath,
      );
      return { file: outputPath };
    },
  };
}
