export interface HttpClient {
  get(url: string, headers?: Record<string, string>): Promise<Response>;
  post(url: string, body: unknown, headers?: Record<string, string>): Promise<Response>;
  put(url: string, body: unknown, headers?: Record<string, string>): Promise<Response>;
  delete(url: string, headers?: Record<string, string>): Promise<Response>;
}

export interface Response {
  status: number;
  statusText: string;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

