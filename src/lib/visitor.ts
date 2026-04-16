const VISITOR_KEY = 'budgetroad_visitor_id';

export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';

  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function isReturningVisitor(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(VISITOR_KEY) !== null;
}
