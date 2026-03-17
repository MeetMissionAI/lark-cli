import type { LarkClient } from '../client.js';
import type { CommandMap } from '../types.js';

export function register(client: LarkClient): CommandMap {
  return {
    'history': async (args, flags) => {
      const [chatId] = args;
      const query: Record<string, string | undefined> = {
        container_id_type: 'chat',
        container_id: chatId,
      };
      if (flags.count) query.page_size = flags.count;
      if (flags['start-time']) query.start_time = flags['start-time'];
      if (flags['end-time']) query.end_time = flags['end-time'];
      if (flags['page-token']) query.page_token = flags['page-token'];
      if (flags.sort) query.sort_type = flags.sort;
      return client.get('/im/v1/messages', query);
    },

    'members': async (args, flags) => {
      const [chatId] = args;
      const query: Record<string, string | undefined> = {
        member_id_type: 'open_id',
      };
      if (flags['page-size']) query.page_size = flags['page-size'];
      if (flags['page-token']) query.page_token = flags['page-token'];
      return client.get(`/im/v1/chats/${chatId}/members`, query);
    },

    'create': async (args, flags) => {
      const [name] = args;
      const body: Record<string, any> = {};
      if (name) body.name = name;
      if (flags.description) body.description = flags.description;
      if (flags['user-ids']) body.user_id_list = flags['user-ids'].split(',');
      return client.post('/im/v1/chats?user_id_type=open_id', body);
    },

    'add-members': async (args, _flags) => {
      const [chatId, ...idList] = args;
      return client.post(
        `/im/v1/chats/${chatId}/members?member_id_type=open_id`,
        { id_list: idList },
      );
    },
  };
}
