import { apiGet } from '@/api/client';
import type { Kind, Category } from '@/api/types';

export const listCategories = (kind?: Kind) => apiGet<Category[]>(`/categories${kind ? `?kind=${kind}` : ''}`);
