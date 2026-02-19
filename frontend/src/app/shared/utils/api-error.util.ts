/**
 * Extracts a user-friendly error message from an HTTP error response.
 * Supports API format: { error: string, code?: string } or { message: string }.
 */
export function extractApiError(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') return fallback;
  const e = err as { error?: { error?: string; message?: string } | string; message?: string };
  const body = e.error;
  if (body && typeof body === 'object') {
    const msg = body.error ?? body.message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  if (typeof body === 'string' && body.trim()) return body;
  if (typeof e.message === 'string' && e.message.trim()) return e.message;
  return fallback;
}
