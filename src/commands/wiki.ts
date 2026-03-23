import type { LarkClient } from '../client.js';
import type { CommandMap } from '../types.js';
import { createPermissionCommands } from './permission.js';

export function register(client: LarkClient): CommandMap {
  return {
    ...createPermissionCommands(client, 'wiki'),
    'get-space': async (args, _flags) => {
      const [spaceId] = args;
      return client.get(`/wiki/v2/spaces/${spaceId}`);
    },

    'get-node': async (args, _flags) => {
      const [token] = args;
      return client.get('/wiki/v2/spaces/get_node', { token });
    },

    'list-nodes': async (args, flags) => {
      const [spaceId] = args;
      const query: Record<string, string | undefined> = {};
      if (flags.parent) query.parent_node_token = flags.parent;
      if (flags['page-token']) query.page_token = flags['page-token'];
      if (flags['page-size']) query.page_size = flags['page-size'];
      return client.get(`/wiki/v2/spaces/${spaceId}/nodes`, query);
    },

    'create-node': async (args, flags) => {
      const [spaceId, objType, objToken] = args;
      const body: Record<string, any> = {
        obj_type: objType,
        obj_token: objToken,
        node_type: 'origin',
      };
      if (flags.parent) body.parent_node_token = flags.parent;
      if (flags.title) body.title = flags.title;
      return client.post(`/wiki/v2/spaces/${spaceId}/nodes`, body);
    },

    'list-children': async (args, flags) => {
      const [spaceId, parentNodeToken] = args;
      const query: Record<string, string | undefined> = {
        parent_node_token: parentNodeToken,
      };
      if (flags['page-token']) query.page_token = flags['page-token'];
      if (flags['page-size']) query.page_size = flags['page-size'];
      return client.get(`/wiki/v2/spaces/${spaceId}/nodes`, query);
    },

    'move-node': async (args, flags) => {
      const [spaceId, nodeToken] = args;
      const body: Record<string, any> = {};
      if (flags['target-parent-token']) body.target_parent_token = flags['target-parent-token'];
      if (flags['target-space-id']) body.target_space_id = flags['target-space-id'];
      return client.post(`/wiki/v2/spaces/${spaceId}/nodes/${nodeToken}/move`, body);
    },

    'update-title': async (args, _flags) => {
      const [spaceId, nodeToken, title] = args;
      return client.post(`/wiki/v2/spaces/${spaceId}/nodes/${nodeToken}/update_title`, { title });
    },
  };
}
