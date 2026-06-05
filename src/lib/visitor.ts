import { STORAGE_KEYS } from '@/lib/storage-keys';

export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';

  let id = localStorage.getItem(STORAGE_KEYS.VISITOR);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEYS.VISITOR, id);
  }
  return id;
}

export function isReturningVisitor(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.VISITOR) !== null;
}
