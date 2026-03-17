import type { LarkClient } from '../client.js';
import type { CommandMap } from '../types.js';

export function register(client: LarkClient): CommandMap {
  return {
    'create': async (_args, flags) => {
      const body: Record<string, string> = {};
      if (flags.title) body.title = flags.title;
      if (flags.folder) body.folder_token = flags.folder;
      return client.post('/sheets/v3/spreadsheets', body);
    },

    'metadata': async (args, _flags) => {
      const [token] = args;
      return client.get(`/sheets/v2/spreadsheets/${token}/metainfo`);
    },

    'read': async (args, flags) => {
      const [token, range] = args;
      const query: Record<string, string | undefined> = {};
      if (flags.render) query.valueRenderOption = flags.render;
      if (flags['date-render']) query.dateTimeRenderOption = flags['date-render'];
      return client.get(
        `/sheets/v2/spreadsheets/${token}/values/${range}`,
        query,
      );
    },

    'write': async (args, _flags) => {
      const [token, range, valuesJson] = args;
      const values = JSON.parse(valuesJson);
      return client.put(`/sheets/v2/spreadsheets/${token}/values`, {
        valueRange: { range, values },
      });
    },

    'append': async (args, _flags) => {
      const [token, range, valuesJson] = args;
      const values = JSON.parse(valuesJson);
      return client.post(`/sheets/v2/spreadsheets/${token}/values_append`, {
        valueRange: { range, values },
      });
    },

    'prepend': async (args, _flags) => {
      const [token, range, valuesJson] = args;
      const values = JSON.parse(valuesJson);
      return client.post(`/sheets/v2/spreadsheets/${token}/values_prepend`, {
        valueRange: { range, values },
      });
    },

    'add-sheet': async (args, flags) => {
      const [token, title] = args;
      const properties: Record<string, any> = { title };
      if (flags.rows) properties.rowCount = Number(flags.rows);
      if (flags.cols) properties.columnCount = Number(flags.cols);
      return client.post(
        `/sheets/v2/spreadsheets/${token}/sheets_batch_update`,
        { requests: [{ addSheet: { properties } }] },
      );
    },

    'delete-sheet': async (args, _flags) => {
      const [token, sheetId] = args;
      return client.post(
        `/sheets/v2/spreadsheets/${token}/sheets_batch_update`,
        { requests: [{ deleteSheet: { sheetId } }] },
      );
    },

    'update-sheet': async (args, flags) => {
      const [token, sheetId] = args;
      const properties: Record<string, any> = { sheetId };
      if (flags.title) properties.title = flags.title;
      if (flags.index) properties.index = Number(flags.index);
      return client.post(
        `/sheets/v2/spreadsheets/${token}/sheets_batch_update`,
        { requests: [{ updateSheet: { properties } }] },
      );
    },

    'add-dimension': async (args, _flags) => {
      const [token, sheetId, majorDimension, length] = args;
      return client.post(
        `/sheets/v2/spreadsheets/${token}/dimension_range`,
        {
          dimension: {
            sheetId,
            majorDimension,
            length: Number(length),
          },
        },
      );
    },

    'delete-dimension': async (args, _flags) => {
      const [token, sheetId, majorDimension, start, end] = args;
      return client.delete(
        `/sheets/v2/spreadsheets/${token}/dimension_range`,
        {
          dimension: {
            sheetId,
            majorDimension,
            startIndex: Number(start),
            endIndex: Number(end),
          },
        },
      );
    },

    'find': async (args, flags) => {
      const [token, sheetId, value] = args;
      const find_condition: Record<string, any> = {};
      if (flags.range) find_condition.range = flags.range;
      return client.post(
        `/sheets/v3/spreadsheets/${token}/sheets/${sheetId}/find`,
        { find: value, find_condition },
      );
    },

    'replace': async (args, flags) => {
      const [token, sheetId, findValue, replacement] = args;
      const find_condition: Record<string, any> = {};
      if (flags.range) find_condition.range = flags.range;
      return client.post(
        `/sheets/v3/spreadsheets/${token}/sheets/${sheetId}/replace`,
        { find: findValue, replacement, find_condition },
      );
    },

    'transfer-owner': async (args, _flags) => {
      const [token, memberType, memberId] = args;
      return client.post('/drive/permission/member/transfer', {
        token,
        type: 'sheet',
        owner: {
          member_type: memberType,
          member_id: memberId,
        },
      });
    },
  };
}
