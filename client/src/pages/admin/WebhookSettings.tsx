import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Webhook,
  MessageSquare,
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
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface WebhookConfig {
  id: string;
  name: string;
  type: "slack" | "discord" | "custom";
  url: string;
  enabled: boolean;
  events: string[];
  lastTriggered?: Date;
  status: "active" | "error" | "untested";
}

// Mock data - in production this would come from the database
const mockWebhooks: WebhookConfig[] = [
  {
    id: "1",
    name: "YETO Alerts Channel",
    type: "slack",
    url: "https://hooks.slack.com/services/xxx/yyy/zzz",
    enabled: true,
    events: ["critical_alert", "connector_failure"],
    lastTriggered: new Date(Date.now() - 3600000),
    status: "active",
  },
  {
    id: "2",
    name: "Data Team Discord",
    type: "discord",
    url: "https://discord.com/api/webhooks/xxx/yyy",
    enabled: true,
    events: ["stale_data", "new_publication"],
    lastTriggered: new Date(Date.now() - 86400000),
    status: "active",
  },
];

const eventTypes = [
  { id: "critical_alert", label: "Critical Alerts", description: "System failures and critical issues" },
  { id: "connector_failure", label: "Connector Failures", description: "When a data connector fails to fetch" },
  { id: "stale_data", label: "Stale Data Warnings", description: "When data becomes older than threshold" },
  { id: "new_publication", label: "New Publications", description: "Auto-generated reports and digests" },
  { id: "anomaly_detected", label: "Anomaly Detection", description: "Unusual patterns in economic data" },
  { id: "user_signup", label: "New User Signups", description: "When new users register" },
];

export default function WebhookSettings() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(mockWebhooks);
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    type: "slack" as "slack" | "discord" | "custom",
    url: "",
    events: [] as string[],
  });
  const [isAdding, setIsAdding] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    setTestingId(webhook.id);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success("Test message sent!", {
      description: `Webhook "${webhook.name}" is working correctly.`,
    });
    
    setTestingId(null);
  };

  const handleToggleWebhook = (id: string) => {
    setWebhooks(webhooks.map(w => 
      w.id === id ? { ...w, enabled: !w.enabled } : w
    ));
    toast.success("Webhook updated");
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    toast.success("Webhook deleted");
  };

  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast.error("Please fill in all required fields");
      return;
    }

    const webhook: WebhookConfig = {
      id: Date.now().toString(),
      ...newWebhook,
      enabled: true,
      status: "untested",
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ name: "", type: "slack", url: "", events: [] });
    setIsAdding(false);
    toast.success("Webhook added successfully");
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
      default: return <Webhook className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>;
      case "error": return <Badge variant="destructive">Error</Badge>;
      default: return <Badge variant="outline">Untested</Badge>;
    }
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
              Configure Slack, Discord, and custom webhooks to receive real-time alerts 
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
                        <option value="custom">Custom HTTP</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">Webhook URL</Label>
                    <Input
                      id="url"
                      placeholder={
                        newWebhook.type === "slack" 
                          ? "https://hooks.slack.com/services/..." 
                          : newWebhook.type === "discord"
                          ? "https://discord.com/api/webhooks/..."
                          : "https://your-endpoint.com/webhook"
                      }
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Events to Subscribe</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {eventTypes.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => toggleEvent(event.id)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            newWebhook.events.includes(event.id)
                              ? "border-primary bg-primary/10"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <p className="font-medium text-sm">{event.label}</p>
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddWebhook}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Save Webhook
                    </Button>
                    <Button variant="outline" onClick={() => setIsAdding(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Webhook List */}
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <Card key={webhook.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          webhook.type === "slack" ? "bg-[#4A154B]/10" :
                          webhook.type === "discord" ? "bg-[#5865F2]/10" :
                          "bg-gray-100"
                        }`}>
                          {getTypeIcon(webhook.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{webhook.name}</h3>
                            {getStatusBadge(webhook.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {webhook.url.substring(0, 50)}...
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {webhook.events.map((event) => (
                              <Badge key={event} variant="outline" className="text-xs">
                                {eventTypes.find(e => e.id === event)?.label || event}
                              </Badge>
                            ))}
                          </div>
                          {webhook.lastTriggered && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`toggle-${webhook.id}`} className="text-sm">
                            {webhook.enabled ? "Enabled" : "Disabled"}
                          </Label>
                          <Switch
                            id={`toggle-${webhook.id}`}
                            checked={webhook.enabled}
                            onCheckedChange={() => handleToggleWebhook(webhook.id)}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestWebhook(webhook)}
                          disabled={testingId === webhook.id}
                        >
                          {testingId === webhook.id ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span>
                              Testing...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Test
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteWebhook(webhook.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {webhooks.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Webhook className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No webhooks configured</h3>
                    <p className="text-muted-foreground mb-4">
                      Add a webhook to receive real-time notifications
                    </p>
                    <Button onClick={() => setIsAdding(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Webhook
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Available Event Types</CardTitle>
                <CardDescription>
                  Subscribe your webhooks to any of these event types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventTypes.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {event.id.includes("critical") || event.id.includes("failure") ? (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          ) : event.id.includes("anomaly") ? (
                            <Zap className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <Info className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{event.label}</h4>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {webhooks.filter(w => w.events.includes(event.id)).length} webhooks
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Recent Delivery Logs</CardTitle>
                <CardDescription>
                  View the history of webhook deliveries and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { webhook: "YETO Alerts Channel", event: "critical_alert", status: "success", time: "2 hours ago" },
                    { webhook: "Data Team Discord", event: "stale_data", status: "success", time: "1 day ago" },
                    { webhook: "YETO Alerts Channel", event: "connector_failure", status: "success", time: "2 days ago" },
                    { webhook: "Data Team Discord", event: "new_publication", status: "failed", time: "3 days ago" },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {log.status === "success" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{log.webhook}</p>
                          <p className="text-sm text-muted-foreground">
                            {eventTypes.find(e => e.id === log.event)?.label}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={log.status === "success" ? "outline" : "destructive"}>
                          {log.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Setup Guides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#4A154B]" />
                Slack Setup Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>1. Go to your Slack workspace settings</p>
              <p>2. Navigate to Apps → Incoming Webhooks</p>
              <p>3. Create a new webhook and select a channel</p>
              <p>4. Copy the webhook URL and paste it above</p>
              <Button variant="link" className="p-0 h-auto gap-1">
                View Slack Documentation <ExternalLink className="w-3 h-3" />
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
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>1. Open your Discord server settings</p>
              <p>2. Go to Integrations → Webhooks</p>
              <p>3. Create a new webhook for your channel</p>
              <p>4. Copy the webhook URL and paste it above</p>
              <Button variant="link" className="p-0 h-auto gap-1">
                View Discord Documentation <ExternalLink className="w-3 h-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
