import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Shield,
  Code
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "wouter";

interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
  status: "active" | "expired" | "revoked";
  tier: "pro" | "institutional";
  requestsToday: number;
  requestsLimit: number;
}

export default function APIKeys() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isArabic = language === "ar";
  const [showKey, setShowKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyTier, setNewKeyTier] = useState<"pro" | "institutional">("pro");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Sample API keys for demonstration
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: "1",
      name: "Production API Key",
      key: "yeto_prod_sk_1234567890abcdef1234567890abcdef",
      createdAt: "2025-12-28",
      lastUsed: "2026-01-10",
      status: "active",
      tier: "pro",
      requestsToday: 45,
      requestsLimit: 1000
    },
    {
      id: "2",
      name: "Development API Key",
      key: "yeto_dev_sk_abcdef1234567890abcdef1234567890",
      createdAt: "2026-01-02",
      lastUsed: "2026-01-09",
      status: "active",
      tier: "pro",
      requestsToday: 12,
      requestsLimit: 1000
    },
    {
      id: "3",
      name: "Legacy Key (Expired)",
      key: "yeto_old_sk_0000000000000000000000000000000",
      createdAt: "2024-10-01",
      lastUsed: "2024-11-15",
      status: "expired",
      tier: "pro",
      requestsToday: 0,
      requestsLimit: 1000
    }
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(isArabic ? "تم نسخ المفتاح" : "API key copied to clipboard");
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error(isArabic ? "يرجى إدخال اسم للمفتاح" : "Please enter a key name");
      return;
    }

    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `yeto_${newKeyTier}_sk_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: null,
      status: "active",
      tier: newKeyTier,
      requestsToday: 0,
      requestsLimit: newKeyTier === "institutional" ? 10000 : 1000
    };

    setApiKeys([newKey, ...apiKeys]);
    setNewKeyName("");
    setIsCreateDialogOpen(false);
    toast.success(isArabic ? "تم إنشاء المفتاح بنجاح" : "API key created successfully");
  };

  const handleRevokeKey = (keyId: string) => {
    setApiKeys(apiKeys.map(k => 
      k.id === keyId ? { ...k, status: "revoked" as const } : k
    ));
    toast.success(isArabic ? "تم إلغاء المفتاح" : "API key revoked");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{isArabic ? "نشط" : "Active"}</Badge>;
      case "expired":
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />{isArabic ? "منتهي" : "Expired"}</Badge>;
      case "revoked":
        return <Badge className="bg-red-500"><AlertTriangle className="h-3 w-3 mr-1" />{isArabic ? "ملغى" : "Revoked"}</Badge>;
      default:
        return null;
    }
  };

  // Check if user has API access
  const hasAPIAccess = true; // In production, check user.subscription tier

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={isArabic ? "rtl" : "ltr"}>
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle>{isArabic ? "تسجيل الدخول مطلوب" : "Login Required"}</CardTitle>
            <CardDescription>
              {isArabic 
                ? "يرجى تسجيل الدخول للوصول إلى مفاتيح API" 
                : "Please log in to access API keys"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/">
                {isArabic ? "العودة للرئيسية" : "Back to Home"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAPIAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={isArabic ? "rtl" : "ltr"}>
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <Key className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <CardTitle>{isArabic ? "ترقية مطلوبة" : "Upgrade Required"}</CardTitle>
            <CardDescription>
              {isArabic 
                ? "الوصول إلى API متاح فقط لمشتركي Pro و Institutional" 
                : "API access is only available for Pro and Institutional subscribers"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/pricing">
                {isArabic ? "عرض الخطط" : "View Plans"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#768064] to-[#1a4a70] text-white py-8">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Key className="h-8 w-8" />
                <h1 className="text-3xl font-bold">
                  {isArabic ? "مفاتيح API" : "API Keys"}
                </h1>
              </div>
              <p className="text-white/80">
                {isArabic 
                  ? "إدارة مفاتيح الوصول البرمجي لمنصة يتو" 
                  : "Manage your programmatic access keys for the YETO platform"}
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-[#768064] hover:bg-gray-100">
                  <Plus className="h-4 w-4 mr-2" />
                  {isArabic ? "إنشاء مفتاح جديد" : "Create New Key"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isArabic ? "إنشاء مفتاح API جديد" : "Create New API Key"}</DialogTitle>
                  <DialogDescription>
                    {isArabic 
                      ? "أدخل اسماً وصفياً للمفتاح الجديد" 
                      : "Enter a descriptive name for your new API key"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {isArabic ? "اسم المفتاح" : "Key Name"}
                    </label>
                    <Input 
                      placeholder={isArabic ? "مثال: مفتاح الإنتاج" : "e.g., Production API Key"}
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {isArabic ? "المستوى" : "Tier"}
                    </label>
                    <Select value={newKeyTier} onValueChange={(v) => setNewKeyTier(v as "pro" | "institutional")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pro">Pro (1,000 {isArabic ? "طلب/يوم" : "requests/day"})</SelectItem>
                        <SelectItem value="institutional">Institutional (10,000 {isArabic ? "طلب/يوم" : "requests/day"})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {isArabic ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button onClick={handleCreateKey}>
                    {isArabic ? "إنشاء" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* API Keys List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "مفاتيحك" : "Your API Keys"}</CardTitle>
                <CardDescription>
                  {isArabic 
                    ? `لديك ${apiKeys.filter(k => k.status === 'active').length} مفتاح نشط` 
                    : `You have ${apiKeys.filter(k => k.status === 'active').length} active key(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div 
                    key={apiKey.id} 
                    className={`p-4 border rounded-lg ${apiKey.status !== 'active' ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{apiKey.name}</h4>
                          {getStatusBadge(apiKey.status)}
                          <Badge variant="outline">{apiKey.tier}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {isArabic ? "تم الإنشاء:" : "Created:"} {apiKey.createdAt}
                          {apiKey.lastUsed && (
                            <> • {isArabic ? "آخر استخدام:" : "Last used:"} {apiKey.lastUsed}</>
                          )}
                        </p>
                      </div>
                      {apiKey.status === 'active' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => handleRevokeKey(apiKey.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 bg-gray-100 p-2 rounded font-mono text-sm">
                      <code className="flex-1 overflow-hidden">
                        {showKey === apiKey.id 
                          ? apiKey.key 
                          : apiKey.key.substring(0, 20) + "••••••••••••••••"}
                      </code>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                      >
                        {showKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    {apiKey.status === 'active' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">
                            {isArabic ? "الاستخدام اليومي" : "Daily Usage"}
                          </span>
                          <span>{apiKey.requestsToday} / {apiKey.requestsLimit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#4C583E] h-2 rounded-full" 
                            style={{ width: `${(apiKey.requestsToday / apiKey.requestsLimit) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {isArabic ? "إحصائيات الاستخدام" : "Usage Statistics"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">{isArabic ? "الطلبات اليوم" : "Requests Today"}</span>
                  <span className="font-medium">57</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{isArabic ? "هذا الشهر" : "This Month"}</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{isArabic ? "المفاتيح النشطة" : "Active Keys"}</span>
                  <span className="font-medium">{apiKeys.filter(k => k.status === 'active').length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Security Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {isArabic ? "نصائح أمنية" : "Security Tips"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>• {isArabic ? "لا تشارك مفاتيحك مع أي شخص" : "Never share your API keys with anyone"}</p>
                <p>• {isArabic ? "استخدم متغيرات البيئة لتخزين المفاتيح" : "Use environment variables to store keys"}</p>
                <p>• {isArabic ? "قم بتدوير المفاتيح بانتظام" : "Rotate your keys regularly"}</p>
                <p>• {isArabic ? "ألغِ المفاتيح غير المستخدمة" : "Revoke unused keys"}</p>
              </CardContent>
            </Card>

            {/* Quick Start */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {isArabic ? "بداية سريعة" : "Quick Start"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`curl -X GET \\
  "https://api.yeto.io/v1/indicators" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                </pre>
                <Button variant="link" className="mt-2 p-0" asChild>
                  <Link href="/docs/api">
                    {isArabic ? "عرض التوثيق الكامل" : "View Full Documentation"} →
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
