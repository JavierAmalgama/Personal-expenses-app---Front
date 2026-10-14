import { API_TOKEN, API_URL } from '@/config';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const apiGet = <T>(path: string) => request<T>('GET', path);
export const apiPost = <T>(path: string, body: object) => request<T>('POST', path, body);
export const apiPatch = <T>(path: string, body: object) => request<T>('PATCH', path, body);
export const apiDelete = <T>(path: string) => request<T>('DELETE', path);

// GET /up answers with an HTML page, so only the status code matters.
export async function checkHealth(): Promise<true> {
  const response = await send('GET', '/up');
  if (!response.ok) throw new ApiError(response.status, `La API respondió ${response.status}`);
  return true;
}

async function request<T>(method: string, path: string, body?: object): Promise<T> {
  const response = await send(method, path, body);

  if (!response.ok) {
    const json = await response.json().catch(() => null);
    throw new ApiError(response.status, errorMessage(response.status, json?.response));
  }

  return response.json();
}

async function send(method: string, path: string, body?: object): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (API_TOKEN) headers.Authorization = API_TOKEN;
  if (body) headers['Content-Type'] = 'application/json';

  try {
    return await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, `No se pudo conectar con ${API_URL}. ¿Está corriendo el backend?`);
  }
}

function errorMessage(status: number, error?: { error_name?: string; error_message?: unknown }) {
  // Validation errors come as { field: ["message", ...] }
  const details = error?.error_message;
  if (details && typeof details === 'object') {
    return Object.entries(details as Record<string, string[]>)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n');
  }
  if (typeof details === 'string') return details;

  if (status === 401) return 'Falta el token (EXPO_PUBLIC_API_TOKEN)';
  if (status === 403) return 'Token inválido o vencido';
  return `Error ${status}`;
}
