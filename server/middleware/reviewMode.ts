/**
 * Review Mode Middleware
 * 
 * Implements the REVIEW_MODE feature flag system:
 * - When REVIEW_MODE=true, authentication is bypassed
 * - Admin pages are visible but READ-ONLY
 * - POST/PUT/PATCH/DELETE return 403 in review mode
 * - Hard guard prevents REVIEW_MODE=true in production
 */

import type { Request, Response, NextFunction } from 'express';

// Environment configuration
export const REVIEW_MODE = process.env.REVIEW_MODE === 'true';
export const APP_ENV = (process.env.APP_ENV || 'local') as 'local' | 'staging' | 'prod';

/**
 * Hard guard: Refuse to start if REVIEW_MODE=true in production
 */
export function validateReviewModeConfig(): void {
  if (APP_ENV === 'prod' && REVIEW_MODE) {
    console.error('FATAL: REVIEW_MODE=true is not allowed when APP_ENV=prod');
    console.error('This is a security violation. Application will not start.');
    process.exit(1);
  }
  
  if (REVIEW_MODE) {
    console.log('⚠️  REVIEW MODE ENABLED - Authentication bypassed, admin pages read-only');
    console.log(`   Environment: ${APP_ENV}`);
  }
}

/**
 * Review mode status for client
 */
export function getReviewModeStatus() {
  return {
    enabled: REVIEW_MODE,
    environment: APP_ENV,
    message: REVIEW_MODE 
      ? 'REVIEW MODE — Login disabled — Read-only — Not for production'
      : null,
    messageAr: REVIEW_MODE 
      ? 'وضع المراجعة — تسجيل الدخول معطل — للقراءة فقط — ليس للإنتاج'
      : null
  };
}

/**
 * Middleware to enforce read-only mode for mutating requests
 */
export function reviewModeReadOnly(req: Request, res: Response, next: NextFunction): void {
  if (!REVIEW_MODE) {
    return next();
  }
  
  // Allow GET and HEAD requests
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  
  // Block mutating requests in review mode
  const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (mutatingMethods.includes(req.method)) {
    // Allow certain safe endpoints even in review mode
    const safeEndpoints = [
      '/api/trpc/auth.me', // Auth check
      '/api/trpc/system.reviewModeStatus', // Review mode status
    ];
    
    if (safeEndpoints.some(endpoint => req.path.includes(endpoint))) {
      return next();
    }
    
    res.status(403).json({
      error: 'Read-only Review Mode',
      message: 'This action is disabled in review mode. The platform is currently in read-only mode for review purposes.',
      messageAr: 'هذا الإجراء معطل في وضع المراجعة. المنصة حاليًا في وضع القراءة فقط لأغراض المراجعة.',
      code: 'REVIEW_MODE_READ_ONLY'
    });
    return;
  }
  
  next();
}

/**
 * Mock user for review mode (bypasses authentication)
 */
export const REVIEW_MODE_USER = {
  id: 0,
  openId: 'review-mode-user',
  name: 'Review Mode User',
  email: 'review@yeto.platform',
  role: 'admin' as const,
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isReviewMode: true
};

/**
 * Get user for context - returns mock user in review mode
 */
export function getReviewModeUser() {
  return REVIEW_MODE ? REVIEW_MODE_USER : null;
}
