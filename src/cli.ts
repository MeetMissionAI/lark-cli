#!/usr/bin/env node

import { LarkClient } from './client.js';
import type { CommandMap } from './types.js';

const MODULE_LOADERS: Record<string, () => Promise<{ register: (client: LarkClient) => CommandMap }>> = {
  doc: () => import('./commands/doc.js'),
  wiki: () => import('./commands/wiki.js'),
  chat: () => import('./commands/chat.js'),
  bitable: () => import('./commands/bitable.js'),
  sheets: () => import('./commands/sheets.js'),
  drive: () => import('./commands/drive.js'),
};

function parseArgs(argv: string[]): {
  module: string;
  command: string;
  positional: string[];
  flags: Record<string, string>;
} {
  const [module, command, ...rest] = argv;
  const positional: string[] = [];
  const flags: Record<string, string> = {};

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = rest[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = 'true';
      }
    } else {
      positional.push(arg);
    }
  }

  return { module: module ?? '', command: command ?? '', positional, flags };
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

async function main() {
  const { module, command, positional, flags } = parseArgs(process.argv.slice(2));

  if (!module || !command) {
    const modules = Object.keys(MODULE_LOADERS).join(', ');
    process.stderr.write(
      JSON.stringify({ error: `Usage: lark-cli <module> <command> [args...]. Modules: ${modules}` }) + '\n',
    );
    process.exit(1);
  }

  const loader = MODULE_LOADERS[module];
  if (!loader) {
    process.stderr.write(
      JSON.stringify({ error: `Unknown module: ${module}. Available: ${Object.keys(MODULE_LOADERS).join(', ')}` }) + '\n',
    );
    process.exit(1);
  }

  if (flags.stdin) {
    const stdinData = await readStdin();
    positional.push(stdinData.trim());
    delete flags.stdin;
  }

  try {
    const client = new LarkClient();
    const mod = await loader();
    const commands = mod.register(client);
    const handler = commands[command];

    if (!handler) {
      const available = Object.keys(commands).join(', ');
      process.stderr.write(
        JSON.stringify({ error: `Unknown command: ${module} ${command}. Available: ${available}` }) + '\n',
      );
      process.exit(1);
    }

    const result = await handler(positional, flags);
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } catch (err: any) {
    const output: Record<string, unknown> = { error: err.message };
    if ('code' in err) output.code = err.code;
    process.stderr.write(JSON.stringify(output) + '\n');
    process.exit(1);
  }
}

main();
