import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Webhook,
  MessageSquare,
  Mail,
  Bell,
  CheckCircle2,
  XCircle,
  Send,
  Plus,
  Trash2,
  Settings,
  AlertTriangle,
  Info,
  Zap,
  ExternalLink,
  RefreshCw,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function WebhookSettings() {
  const utils = trpc.useUtils();
  
  // Fetch webhooks from backend
  // @ts-ignore
  const { data: webhooks, isLoading: webhooksLoading } = trpc.admin.getWebhooks.useQuery();
  // @ts-ignore
  const { data: eventTypes, isLoading: eventsLoading } = trpc.admin.getWebhookEventTypes.useQuery();
  // @ts-ignore
  const { data: deliveryLogs, isLoading: logsLoading } = trpc.admin.getWebhookDeliveryLogs.useQuery({ limit: 50 });

  // Mutations
  // @ts-ignore
  const createWebhook = trpc.admin.createWebhook.useMutation({
    onSuccess: () => {
      toast.success("Webhook created successfully");
      // @ts-ignore
      utils.admin.getWebhooks.invalidate();
      setIsAdding(false);
      setNewWebhook({ name: "", type: "slack", url: "", events: [] });
    },
    onError: (error: any) => {
      toast.error("Failed to create webhook", { description: error.message });
    },
  });

  // @ts-ignore
  const toggleWebhook = trpc.admin.toggleWebhook.useMutation({
    onSuccess: () => {
      toast.success("Webhook updated");
      // @ts-ignore
      utils.admin.getWebhooks.invalidate();
    },
  });

  // @ts-ignore
  const deleteWebhook = trpc.admin.deleteWebhook.useMutation({
    onSuccess: () => {
      toast.success("Webhook deleted");
      // @ts-ignore
      utils.admin.getWebhooks.invalidate();
    },
  });

  // @ts-ignore
  const testWebhook = trpc.admin.testWebhook.useMutation({
    onSuccess: (result: any) => {
      if (result.success) {
        toast.success("Test message sent!", {
          description: `Webhook responded with status ${result.status} in ${result.duration}ms`,
        });
      } else {
        toast.error("Test failed", { description: result.error });
      }
      // @ts-ignore
      utils.admin.getWebhooks.invalidate();
      // @ts-ignore
      utils.admin.getWebhookDeliveryLogs.invalidate();
      setTestingId(null);
    },
    onError: (error: any) => {
      toast.error("Test failed", { description: error.message });
      setTestingId(null);
    },
  });

  const [newWebhook, setNewWebhook] = useState({
    name: "",
    type: "slack" as "slack" | "discord" | "email" | "custom",
    url: "",
    events: [] as string[],
  });
  const [isAdding, setIsAdding] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);

  const handleTestWebhook = async (webhook: any) => {
    setTestingId(webhook.id);
    testWebhook.mutate({ id: webhook.id });
  };

  const handleToggleWebhook = (id: number, currentEnabled: boolean) => {
    toggleWebhook.mutate({ id, enabled: !currentEnabled });
  };

  const handleDeleteWebhook = (id: number) => {
    if (confirm("Are you sure you want to delete this webhook?")) {
      deleteWebhook.mutate({ id });
    }
  };

  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast.error("Please fill in all required fields");
      return;
    }
    createWebhook.mutate(newWebhook);
  };

  const toggleEvent = (eventId: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId],
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "slack": return <MessageSquare className="w-5 h-5 text-[#4A154B]" />;
      case "discord": return <MessageSquare className="w-5 h-5 text-[#5865F2]" />;
      case "email": return <Mail className="w-5 h-5 text-blue-500" />;
      default: return <Webhook className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (webhook: any) => {
    if (webhook.failureCount > 3) {
      return <Badge variant="destructive">Error</Badge>;
    }
    if (webhook.lastTriggered) {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>;
    }
    return <Badge variant="outline">Untested</Badge>;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Webhook className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold">Webhook Notifications</h1>
            </div>
            <p className="text-white/80 max-w-2xl">
              Configure Slack, Discord, Email, and custom webhooks to receive real-time alerts 
              about system events, data updates, and anomalies.
            </p>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </div>

        <Tabs defaultValue="webhooks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="webhooks">Configured Webhooks</TabsTrigger>
            <TabsTrigger value="events">Event Types</TabsTrigger>
            <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="webhooks" className="space-y-6">
            {/* Add Webhook Button */}
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Webhook
              </Button>
            )}

            {/* Add Webhook Form */}
            {isAdding && (
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Webhook
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Webhook Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Team Alerts Channel"
                        value={newWebhook.name}
                        onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <select
                        id="type"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={newWebhook.type}
                        onChange={(e) => setNewWebhook({ ...newWebhook, type: e.target.value as any })}
                      >
                        <option value="slack">Slack</option>
                        <option value="discord">Discord</option>
                        <option value="email">Email</option>
                        <option value="custom">Custom HTTP</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">
                      {newWebhook.type === "email" ? "Email Address" : "Webhook URL"}
                    </Label>
                    <Input
                      id="url"
                      placeholder={newWebhook.type === "email" ? "alerts@example.com" : "https://hooks.slack.com/services/..."}
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subscribe to Events</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {(eventTypes || []).map((event: any) => (
                        <button
                          key={event.code}
                          type="button"
                          onClick={() => toggleEvent(event.code)}
                          className={`p-2 text-left rounded-lg border transition-colors ${
                            newWebhook.events.includes(event.code)
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="font-medium text-sm">{event.name}</div>
                          <div className="text-xs text-muted-foreground">{event.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddWebhook} disabled={createWebhook.isPending}>
                      {createWebhook.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Add Webhook"
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setIsAdding(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Webhooks List */}
            {webhooksLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (webhooks || []).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Webhook className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Webhooks Configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first webhook to start receiving real-time notifications.
                  </p>
                  <Button onClick={() => setIsAdding(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Webhook
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {(webhooks || []).map((webhook: any) => (
                  <Card key={webhook.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-muted rounded-lg">
                            {getTypeIcon(webhook.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{webhook.name}</h3>
                              {getStatusBadge(webhook)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 font-mono">
                              {webhook.url.length > 50 ? webhook.url.substring(0, 50) + "..." : webhook.url}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(webhook.events || []).map((event: string) => (
                                <Badge key={event} variant="secondary" className="text-xs">
                                  {event.replace(/_/g, " ")}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Last triggered: {formatDate(webhook.lastTriggered)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`toggle-${webhook.id}`} className="text-sm">Enabled</Label>
                            <Switch
                              id={`toggle-${webhook.id}`}
                              checked={webhook.enabled}
                              onCheckedChange={() => handleToggleWebhook(webhook.id, webhook.enabled)}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestWebhook(webhook)}
                            disabled={testingId === webhook.id}
                          >
                            {testingId === webhook.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            <span className="ml-1">Test</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Setup Guides */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#4A154B]" />
                    Slack Setup Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>1. Go to your Slack workspace settings</p>
                  <p>2. Navigate to Apps → Incoming Webhooks</p>
                  <p>3. Create a new webhook and select a channel</p>
                  <p>4. Copy the webhook URL and paste it above</p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <a href="https://api.slack.com/messaging/webhooks" target="_blank" rel="noopener">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Slack Documentation
                    </a>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#5865F2]" />
                    Discord Setup Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>1. Open your Discord server settings</p>
                  <p>2. Go to Integrations → Webhooks</p>
                  <p>3. Create a new webhook for your channel</p>
                  <p>4. Copy the webhook URL and paste it above</p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <a href="https://support.discord.com/hc/en-us/articles/228383668" target="_blank" rel="noopener">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Discord Documentation
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Event Types</CardTitle>
                <CardDescription>
                  Subscribe to these events to receive notifications when they occur
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {Object.entries(
                      (eventTypes || []).reduce((acc: any, event: any) => {
                        if (!acc[event.category]) acc[event.category] = [];
                        acc[event.category].push(event);
                        return acc;
                      }, {})
                    ).map(([category, events]: [string, any]) => (
                      <div key={category}>
                        <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">
                          {category}
                        </h3>
                        <div className="grid gap-2">
                          {events.map((event: any) => (
                            <div
                              key={event.code}
                              className="flex items-center justify-between p-3 rounded-lg border bg-card"
                            >
                              <div>
                                <div className="font-medium">{event.name}</div>
                                <div className="text-sm text-muted-foreground">{event.description}</div>
                              </div>
                              <Badge variant="outline">{event.code}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Delivery Logs</span>
                  <Button
                    variant="outline"
                    size="sm"
                    // @ts-ignore
                    onClick={() => utils.admin.getWebhookDeliveryLogs.invalidate()}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </CardTitle>
                <CardDescription>
                  Recent webhook delivery attempts and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (deliveryLogs || []).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No delivery logs yet</p>
                    <p className="text-sm">Logs will appear here when webhooks are triggered</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(deliveryLogs || []).map((log: any) => (
                      <div
                        key={log.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          log.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {log.success ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <div>
                            <div className="font-medium">{log.webhookName}</div>
                            <div className="text-sm text-muted-foreground">
                              Event: {log.eventType} • {formatDate(log.deliveredAt)}
                            </div>
                            {log.errorMessage && (
                              <div className="text-sm text-red-600 mt-1">{log.errorMessage}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {log.responseStatus && (
                            <Badge variant={log.success ? "default" : "destructive"}>
                              {log.responseStatus}
                            </Badge>
                          )}
                          {log.duration && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {log.duration}ms
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
