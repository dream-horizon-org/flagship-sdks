import type { HttpClient, Response } from '../../common/interfaces/HttpClient';

class ReactNativeResponse implements Response {
  constructor(private response: globalThis.Response) {}

  get status(): number {
    return this.response.status;
  }

  get statusText(): string {
    return this.response.statusText;
  }

  async json(): Promise<unknown> {
    return await this.response.json();
  }

  async text(): Promise<string> {
    return await this.response.text();
  }
}

export class ReactNativeHttpAdapter implements HttpClient {
  async get(url: string, headers?: Record<string, string>): Promise<Response> {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers || {},
    });
    return new ReactNativeResponse(response);
  }

  async post(url: string, body: unknown, headers?: Record<string, string>): Promise<Response> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
    return new ReactNativeResponse(response);
  }

  async put(url: string, body: unknown, headers?: Record<string, string>): Promise<Response> {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
    return new ReactNativeResponse(response);
  }

  async delete(url: string, headers?: Record<string, string>): Promise<Response> {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: headers || {},
    });
    return new ReactNativeResponse(response);
  }
}

