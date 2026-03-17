import type { LarkClient } from '../client.js';
import type { CommandMap } from '../types.js';

export function register(client: LarkClient): CommandMap {
  return {
    'create-app': async (_args, flags) => {
      const body: Record<string, string> = {};
      if (flags.name) body.name = flags.name;
      if (flags.folder) body.folder_token = flags.folder;
      return client.post('/bitable/v1/apps', body);
    },

    'create-tables': async (args, _flags) => {
      const [appToken, tablesJson] = args;
      const tables = JSON.parse(tablesJson);
      return client.post(
        `/bitable/v1/apps/${appToken}/tables/batch_create`,
        { tables },
      );
    },

    'delete-tables': async (args, _flags) => {
      const [appToken, ...tableIds] = args;
      return client.post(
        `/bitable/v1/apps/${appToken}/tables/batch_delete`,
        { table_ids: tableIds },
      );
    },

    'list-fields': async (args, _flags) => {
      const [appToken, tableId] = args;
      return client.get(
        `/bitable/v1/apps/${appToken}/tables/${tableId}/fields`,
      );
    },

    'add-records': async (args, _flags) => {
      const [appToken, tableId, recordsJson] = args;
      const records = JSON.parse(recordsJson);
      return client.post(
        `/bitable/v1/apps/${appToken}/tables/${tableId}/records/batch_create`,
        { records },
      );
    },

    'delete-records': async (args, _flags) => {
      const [appToken, tableId, ...recordIds] = args;
      return client.post(
        `/bitable/v1/apps/${appToken}/tables/${tableId}/records/batch_delete`,
        { records: recordIds },
      );
    },

    'list-records': async (args, flags) => {
      const [appToken, tableId] = args;
      const query: Record<string, string | undefined> = {};
      if (flags.filter) query.filter = flags.filter;
      if (flags['page-size']) query.page_size = flags['page-size'];
      if (flags['page-token']) query.page_token = flags['page-token'];
      return client.get(
        `/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
        query,
      );
    },

    'update-records': async (args, _flags) => {
      const [appToken, tableId, recordsJson] = args;
      const records = JSON.parse(recordsJson);
      return client.post(
        `/bitable/v1/apps/${appToken}/tables/${tableId}/records/batch_update`,
        { records },
      );
    },

    'create-field': async (args, _flags) => {
      const [appToken, tableId, fieldJson] = args;
      const field = JSON.parse(fieldJson);
      return client.post(
        `/bitable/v1/apps/${appToken}/tables/${tableId}/fields`,
        field,
      );
    },

    'update-field': async (args, _flags) => {
      const [appToken, tableId, fieldId, fieldJson] = args;
      const field = JSON.parse(fieldJson);
      return client.put(
        `/bitable/v1/apps/${appToken}/tables/${tableId}/fields/${fieldId}`,
        field,
      );
    },

    'delete-field': async (args, _flags) => {
      const [appToken, tableId, fieldId] = args;
      return client.delete(
        `/bitable/v1/apps/${appToken}/tables/${tableId}/fields/${fieldId}`,
      );
    },

    'transfer-owner': async (args, _flags) => {
      const [appToken, memberType, memberId] = args;
      return client.post('/drive/permission/member/transfer', {
        token: appToken,
        type: 'bitable',
        owner: {
          member_type: memberType,
          member_id: memberId,
        },
      });
    },
  };
}
