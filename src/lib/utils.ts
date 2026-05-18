import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DOMPurify from 'isomorphic-dompurify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * ينظف HTML من XSS - استخدمه لأي محتوى من user input بيتعرض كـ HTML
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h2', 'h3', 'code', 'pre', 'blockquote'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOWED_URI_REGEXP: /^(?:https?|mailto):/i,
  });
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Response موحد للأخطاء - منكشفش internal details
 */
export function errorResponse(message: string, status = 400, code?: string) {
  return Response.json({ error: message, code }, { status });
}

export function successResponse<T>(data: T, status = 200) {
  return Response.json({ data }, { status });
}
