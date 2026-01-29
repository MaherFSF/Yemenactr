import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { VIPCockpit } from "@/components/VIPCockpit";
import DashboardLayout from "@/components/DashboardLayout";
import { getLoginUrl } from "@/const";

export default function PresidentCockpit() {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === "ar";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <DashboardLayout>
      <VIPCockpit
        roleId="vip_president"
        customTitle="National Situation Room"
        customTitleAr="غرفة العمليات الوطنية"
      />
    </DashboardLayout>
  );
}
