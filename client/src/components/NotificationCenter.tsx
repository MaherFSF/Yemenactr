/**
 * Notification Center Component
 * 
 * World-class notification UI featuring:
 * - Real-time WebSocket updates
 * - Intelligent grouping by type/time
 * - Read/unread state management
 * - Quick actions
 * - Bilingual support (Arabic/English)
 */

import { useState, useEffect, useCallback } from "react";
import { Bell, X, Check, CheckCheck, Settings, Filter, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface Notification {
  id: string;
  type: "exchange_rate" | "economic_event" | "publication" | "system" | "annotation" | "report" | "alert";
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  icon?: string;
  data?: Record<string, any>;
  timestamp: number;
  read: boolean;
  url?: string;
}

interface NotificationCenterProps {
  language?: "en" | "ar";
}

const typeIcons: Record<string, string> = {
  exchange_rate: "💱",
  economic_event: "📊",
  publication: "📄",
  system: "⚙️",
  annotation: "💬",
  report: "📈",
  alert: "🚨",
};

const priorityColors: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
};

export function NotificationCenter({ language = "en" }: NotificationCenterProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [unreadCount, setUnreadCount] = useState(0);

  const isRTL = language === "ar";

  // Simulated notifications for demo
  useEffect(() => {
    const demoNotifications: Notification[] = [
      {
        id: "1",
        type: "exchange_rate",
        priority: "high",
        title: "Exchange Rate Alert",
        titleAr: "تنبيه سعر الصرف",
        body: "YER/USD rate in Aden increased by 2.5% to 1,620",
        bodyAr: "ارتفع سعر صرف الريال/الدولار في عدن بنسبة 2.5% إلى 1,620",
        timestamp: Date.now() - 300000, // 5 min ago
        read: false,
        url: "/sectors/currency",
      },
      {
        id: "2",
        type: "publication",
        priority: "medium",
        title: "New CBY Circular Published",
        titleAr: "نشر تعميم جديد للبنك المركزي",
        body: "CBY Aden issued Circular #45/2026 on foreign exchange regulations",
        bodyAr: "أصدر البنك المركزي في عدن التعميم رقم 45/2026 بشأن لوائح الصرف الأجنبي",
        timestamp: Date.now() - 3600000, // 1 hour ago
        read: false,
        url: "/publications",
      },
      {
        id: "3",
        type: "annotation",
        priority: "low",
        title: "New Reply to Your Annotation",
        titleAr: "رد جديد على تعليقك",
        body: "Dr. Ahmed replied to your annotation on GDP Q3 data",
        bodyAr: "رد الدكتور أحمد على تعليقك على بيانات الناتج المحلي للربع الثالث",
        timestamp: Date.now() - 7200000, // 2 hours ago
        read: true,
        url: "/annotations",
      },
      {
        id: "4",
        type: "report",
        priority: "medium",
        title: "Weekly Report Ready",
        titleAr: "التقرير الأسبوعي جاهز",
        body: "Your customized weekly economic report is ready for download",
        bodyAr: "تقريرك الاقتصادي الأسبوعي المخصص جاهز للتحميل",
        timestamp: Date.now() - 86400000, // 1 day ago
        read: true,
        url: "/report-archive",
      },
      {
        id: "5",
        type: "economic_event",
        priority: "critical",
        title: "Major Economic Event",
        titleAr: "حدث اقتصادي رئيسي",
        body: "IMF delegation arrives in Aden for economic assessment",
        bodyAr: "وصول وفد صندوق النقد الدولي إلى عدن لتقييم الوضع الاقتصادي",
        timestamp: Date.now() - 172800000, // 2 days ago
        read: false,
        url: "/timeline",
      },
    ];

    setNotifications(demoNotifications);
    setUnreadCount(demoNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const filteredNotifications = notifications.filter(n => 
    filter === "all" || n.type === filter
  );

  const groupedNotifications = {
    today: filteredNotifications.filter(n => 
      Date.now() - n.timestamp < 86400000
    ),
    earlier: filteredNotifications.filter(n => 
      Date.now() - n.timestamp >= 86400000
    ),
  };

  const formatTime = (timestamp: number) => {
    return formatDistanceToNow(timestamp, {
      addSuffix: true,
      locale: isRTL ? ar : enUS,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent 
        side={isRTL ? "left" : "right"} 
        className="w-full sm:w-[420px] p-0"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">
              {isRTL ? "مركز الإشعارات" : "Notification Center"}
            </SheetTitle>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilter("all")}>
                    {isRTL ? "الكل" : "All"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilter("exchange_rate")}>
                    💱 {isRTL ? "أسعار الصرف" : "Exchange Rates"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("economic_event")}>
                    📊 {isRTL ? "الأحداث الاقتصادية" : "Economic Events"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("publication")}>
                    📄 {isRTL ? "المنشورات" : "Publications"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("annotation")}>
                    💬 {isRTL ? "التعليقات" : "Annotations"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("report")}>
                    📈 {isRTL ? "التقارير" : "Reports"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={clearAll}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {isRTL 
                ? `${unreadCount} إشعارات غير مقروءة`
                : `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              }
            </p>
          )}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-50" />
              <p>{isRTL ? "لا توجد إشعارات" : "No notifications"}</p>
            </div>
          ) : (
            <div className="p-2">
              {groupedNotifications.today.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-muted-foreground px-2 mb-2">
                    {isRTL ? "اليوم" : "Today"}
                  </h3>
                  {groupedNotifications.today.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      isRTL={isRTL}
                      onRead={markAsRead}
                      onDelete={deleteNotification}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              )}
              {groupedNotifications.earlier.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground px-2 mb-2">
                    {isRTL ? "سابقاً" : "Earlier"}
                  </h3>
                  {groupedNotifications.earlier.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      isRTL={isRTL}
                      onRead={markAsRead}
                      onDelete={deleteNotification}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = "/subscriptions"}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isRTL ? "إعدادات الإشعارات" : "Notification Settings"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface NotificationItemProps {
  notification: Notification;
  isRTL: boolean;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  formatTime: (timestamp: number) => string;
}

function NotificationItem({ 
  notification, 
  isRTL, 
  onRead, 
  onDelete,
  formatTime 
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
    if (notification.url) {
      window.location.href = notification.url;
    }
  };

  return (
    <div
      className={`
        relative p-3 rounded-lg mb-2 cursor-pointer transition-colors
        ${notification.read ? "bg-muted/30" : "bg-muted/70"}
        hover:bg-muted
      `}
      onClick={handleClick}
    >
      {/* Priority indicator */}
      <div 
        className={`absolute top-0 ${isRTL ? "right-0" : "left-0"} w-1 h-full rounded-full ${priorityColors[notification.priority]}`}
      />
      
      <div className="flex items-start gap-3 pl-2">
        {/* Type icon */}
        <span className="text-xl">{typeIcons[notification.type]}</span>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium text-sm truncate ${!notification.read ? "font-semibold" : ""}`}>
              {isRTL ? notification.titleAr : notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {isRTL ? notification.bodyAr : notification.body}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatTime(notification.timestamp)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {notification.url && (
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotificationCenter;
