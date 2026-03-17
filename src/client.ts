import { writeFile, readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { LarkApiError } from './types.js';
import type { LarkResponse } from './types.js';

const DEFAULT_BASE_URL = 'https://open.larksuite.com/open-apis';

export class LarkClient {
  private token: string | null = null;
  private readonly baseUrl: string;
  private readonly appId: string;
  private readonly appSecret: string;

  constructor() {
    this.appId = process.env.LARK_APP_ID ?? '';
    this.appSecret = process.env.LARK_APP_SECRET ?? '';
    this.baseUrl = process.env.LARK_BASE_URL ?? DEFAULT_BASE_URL;

    if (!this.appId || !this.appSecret) {
      throw new Error('LARK_APP_ID and LARK_APP_SECRET must be set');
    }
  }

  async getToken(): Promise<string> {
    if (this.token) return this.token;

    const res = await fetch(
      `${this.baseUrl}/auth/v3/tenant_access_token/internal`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          app_id: this.appId,
          app_secret: this.appSecret,
        }),
      },
    );

    if (!res.ok) {
      throw new Error(`Token request failed: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as {
      code: number;
      msg: string;
      tenant_access_token: string;
      expire: number;
    };

    if (data.code !== 0) {
      throw new LarkApiError(data.code, `Token error: ${data.msg}`);
    }

    this.token = data.tenant_access_token;
    return this.token;
  }

  async get<T = any>(
    path: string,
    query?: Record<string, string | undefined>,
  ): Promise<T> {
    return this.request('GET', path, undefined, query);
  }

  async post<T = any>(path: string, body?: unknown): Promise<T> {
    return this.request('POST', path, body);
  }

  async put<T = any>(path: string, body?: unknown): Promise<T> {
    return this.request('PUT', path, body);
  }

  async patch<T = any>(path: string, body?: unknown): Promise<T> {
    return this.request('PATCH', path, body);
  }

  async delete<T = any>(path: string, body?: unknown): Promise<T> {
    return this.request('DELETE', path, body);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string | undefined>,
  ): Promise<T> {
    const token = await this.getToken();
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined) url.searchParams.set(k, v);
      }
    }

    const res = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      let detail = '';
      try {
        detail = ` — ${await res.text()}`;
      } catch {}
      throw new Error(`Lark API ${method} ${path} failed: ${res.status}${detail}`);
    }

    const json = (await res.json()) as LarkResponse<T>;
    if (json.code !== 0) {
      throw new LarkApiError(json.code, `Lark API error: ${json.msg}`);
    }

    return json.data;
  }

  async downloadBinary(path: string, outputPath: string): Promise<void> {
    const token = await this.getToken();
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Download failed: ${res.status}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(outputPath, buffer);
  }

  async uploadFile(
    path: string,
    filePath: string,
    fields: Record<string, string>,
  ): Promise<any> {
    const token = await this.getToken();
    const url = `${this.baseUrl}${path}`;
    const fileBuffer = await readFile(filePath);
    const formData = new FormData();

    for (const [k, v] of Object.entries(fields)) {
      formData.append(k, v);
    }
    formData.append('file', new Blob([fileBuffer]), basename(filePath));
    formData.append('size', String(fileBuffer.byteLength));

    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.status}`);
    }

    const json = (await res.json()) as LarkResponse;
    if (json.code !== 0) {
      throw new LarkApiError(json.code, `Upload error: ${json.msg}`);
    }

    return json.data;
  }

  async postRaw<T = any>(
    path: string,
    body: string,
    contentType: string,
  ): Promise<T> {
    const token = await this.getToken();
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': contentType,
      },
      body,
    });

    if (!res.ok) {
      let detail = '';
      try {
        detail = ` — ${await res.text()}`;
      } catch {}
      throw new Error(`Lark API POST ${path} failed: ${res.status}${detail}`);
    }

    const json = (await res.json()) as LarkResponse<T>;
    if (json.code !== 0) {
      throw new LarkApiError(json.code, `Lark API error: ${json.msg}`);
    }

    return json.data;
  }
}
