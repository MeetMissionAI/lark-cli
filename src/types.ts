export interface LarkResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

export class LarkApiError extends Error {
  constructor(
    public readonly code: number,
    message: string,
  ) {
    super(message);
    this.name = 'LarkApiError';
  }
}

export type CommandHandler = (
  args: string[],
  flags: Record<string, string>,
) => Promise<unknown>;

export type CommandMap = Record<string, CommandHandler>;
