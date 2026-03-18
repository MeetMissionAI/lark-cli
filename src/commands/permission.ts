import type { LarkClient } from '../client.js';
import type { CommandMap } from '../types.js';

export function createPermissionCommands(
  client: LarkClient,
  type: string,
): CommandMap {
  return {
    'add-permission': async (args, _flags) => {
      const [token, memberType, memberId, perm] = args;
      return client.post(
        `/drive/v1/permissions/${token}/members?type=${type}`,
        {
          member_type: memberType,
          member_id: memberId,
          perm,
        },
      );
    },

    'update-permission': async (args, _flags) => {
      const [token, memberType, memberId, perm] = args;
      return client.put(
        `/drive/v1/permissions/${token}/members/${memberId}?type=${type}&member_type=${memberType}`,
        {
          member_type: memberType,
          perm,
        },
      );
    },

    'remove-permission': async (args, _flags) => {
      const [token, memberType, memberId] = args;
      return client.delete(
        `/drive/v1/permissions/${token}/members/${memberId}?type=${type}&member_type=${memberType}`,
      );
    },

    'list-permissions': async (args, _flags) => {
      const [token] = args;
      return client.post('/drive/permission/member/list', {
        token,
        type,
      });
    },

    'transfer-owner': async (args, _flags) => {
      const [token, memberType, memberId] = args;
      return client.post('/drive/permission/member/transfer', {
        token,
        type,
        owner: {
          member_type: memberType,
          member_id: memberId,
        },
      });
    },
  };
}
