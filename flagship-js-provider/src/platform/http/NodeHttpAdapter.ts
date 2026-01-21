import https from 'https';
import http from 'http';
import { URL } from 'url';
import type { HttpClient, Response } from '../../common/interfaces/HttpClient';

class NodeResponse implements Response {
  constructor(
    private statusCode: number,
    private statusMessage: string,
    private data: string
  ) {}

  get status(): number {
    return this.statusCode;
  }

  get statusText(): string {
    return this.statusMessage;
  }

  async json(): Promise<unknown> {
    return JSON.parse(this.data);
  }

  async text(): Promise<string> {
    return this.data;
  }
}

function makeRequest(
  url: string,
  options: { method: string; headers?: Record<string, string>; body?: string }
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method,
      headers: options.headers || {},
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(new NodeResponse(res.statusCode || 200, res.statusMessage || '', data));
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

export class NodeHttpAdapter implements HttpClient {
  async get(url: string, headers?: Record<string, string>): Promise<Response> {
    return makeRequest(url, {
      method: 'GET',
      headers: headers || {},
    });
  }

  async post(url: string, body: unknown, headers?: Record<string, string>): Promise<Response> {
    return makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
  }

  async put(url: string, body: unknown, headers?: Record<string, string>): Promise<Response> {
    return makeRequest(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
  }

  async delete(url: string, headers?: Record<string, string>): Promise<Response> {
    return makeRequest(url, {
      method: 'DELETE',
      headers: headers || {},
    });
  }
}

