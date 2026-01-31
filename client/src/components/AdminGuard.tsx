/**
 * Admin Guard Component
 * 
 * Wraps admin pages to enforce authentication and role-based access control.
 * Redirects unauthenticated users to login and shows access denied for non-admins.
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'editor' | 'viewer' | 'analyst' | 'partner_contributor';
}

export function AdminGuard({ children, requiredRole = 'admin' }: AdminGuardProps) {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === "ar";

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2e8b6e] mx-auto mb-4"></div>
          <p className="text-gray-500">
            {isArabic ? "جاري التحقق من الصلاحيات..." : "Verifying permissions..."}
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = getLoginUrl();
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {isArabic ? "جاري إعادة التوجيه لتسجيل الدخول..." : "Redirecting to login..."}
          </p>
        </div>
      </div>
    );
  }

  // Check role-based access - hierarchical permissions
  const allowedRoles: Record<string, string[]> = {
    'admin': ['admin'],
    'editor': ['admin', 'editor'],
    'viewer': ['admin', 'editor', 'viewer'],
    'analyst': ['admin', 'analyst'],
    'partner_contributor': ['admin', 'analyst', 'partner_contributor'],
  };

  const hasAccess = allowedRoles[requiredRole]?.includes(user.role);

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950" dir={isArabic ? "rtl" : "ltr"}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            {isArabic ? "الوصول مرفوض" : "Access Denied"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {isArabic 
              ? `هذه الصفحة تتطلب صلاحيات ${requiredRole === 'admin' ? 'المشرف' : requiredRole === 'editor' ? 'المحرر' : requiredRole === 'viewer' ? 'المشاهد' : requiredRole === 'analyst' ? 'المحلل' : 'الشريك'}. صلاحياتك الحالية: ${user.role}`
              : `This page requires ${requiredRole} privileges. Your current role: ${user.role}`}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="outline">
                {isArabic ? "العودة للرئيسية" : "Go to Home"}
              </Button>
            </Link>
            <Link href="/my-dashboard">
              <Button>
                {isArabic ? "لوحة التحكم" : "My Dashboard"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // User has access - render children
  return <>{children}</>;
}

export default AdminGuard;
