import { apiDelete, apiGet, apiPatch, apiPost } from '@/api/client';
import type { Kind, Movement, MovementInput } from '@/api/types';

type Filters = { month?: string; kind?: Kind; category_id?: number };

export function listMovements(filters: Filters = {}) {
  const query = Object.entries(filters)
    .filter(([, value]) => value != null)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
  return apiGet<Movement[]>(`/movements${query ? `?${query}` : ''}`);
}

export const getMovement = (id: number) => apiGet<Movement>(`/movements/${id}`);
export const createMovement = (input: MovementInput) => apiPost<Movement>('/movements', input);
export const updateMovement = (id: number, input: MovementInput) => apiPatch<Movement>(`/movements/${id}`, input);
export const deleteMovement = (id: number) => apiDelete<void>(`/movements/${id}`);
