import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bookmark, 
  BookOpen, 
  Bell, 
  Plus, 
  Trash2, 
  ExternalLink,
  FolderOpen,
  Search,
  ArrowLeft,
  Clock,
  Star,
  FileText,
  Settings,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

// Mock data for demonstration
const mockBookmarks = [
  { id: 1, title: "Yemen Economic Monitor: Navigating Through Uncertainty", year: 2024, organization: "World Bank", category: "macroeconomic_analysis", addedAt: new Date("2025-12-28") },
  { id: 2, title: "Article IV Consultation - Yemen", year: 2023, organization: "IMF", category: "monetary_policy", addedAt: new Date("2025-12-23") },
  { id: 3, title: "Yemen Food Security Update", year: 2024, organization: "WFP", category: "food_security", addedAt: new Date("2025-12-18") },
];

const mockReadingLists = [
  { id: 1, name: "Banking Sector Analysis", description: "Research on Yemen's split banking system", itemCount: 8, createdAt: new Date("2024-11-01") },
  { id: 2, name: "Humanitarian Finance", description: "Aid flows and effectiveness studies", itemCount: 12, createdAt: new Date("2024-10-15") },
  { id: 3, name: "Currency & Exchange Rate", description: "Monetary policy and FX research", itemCount: 5, createdAt: new Date("2024-09-20") },
];

const mockAlerts = [
  { id: 1, type: "new_publication", query: "World Bank Yemen", frequency: "immediate", lastTriggered: new Date("2026-01-02"), active: true },
  { id: 2, type: "category_update", query: "banking_sector", frequency: "weekly", lastTriggered: new Date("2025-12-28"), active: true },
  { id: 3, type: "organization", query: "IMF", frequency: "monthly", lastTriggered: new Date("2024-11-30"), active: false },
];

const categoryLabels: Record<string, string> = {
  macroeconomic_analysis: "Macroeconomic",
  banking_sector: "Banking",
  monetary_policy: "Monetary Policy",
  food_security: "Food Security",
  humanitarian_finance: "Humanitarian",
};

export default function ResearchLibrary() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("bookmarks");
  const [newListName, setNewListName] = useState("");
  const [showNewListForm, setShowNewListForm] = useState(false);

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    toast.success(`Reading list "${newListName}" created`);
    setNewListName("");
    setShowNewListForm(false);
  };

  const handleRemoveBookmark = (id: number) => {
    toast.success("Bookmark removed");
  };

  const handleToggleAlert = (id: number, active: boolean) => {
    toast.success(active ? "Alert paused" : "Alert activated");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex items-center justify-center">
        <Card className="bg-white/5 border-white/10 max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Sign in to access your library</h2>
            <p className="text-white/60 mb-6">
              Save bookmarks, create reading lists, and set up research alerts.
            </p>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/research-portal">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Research Portal
                </Button>
              </Link>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-emerald-400" />
                <h1 className="text-xl font-bold text-white">My Research Library</h1>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-white/20 text-white/70">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="bookmarks" className="data-[state=active]:bg-emerald-600">
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmarks
              <Badge className="ml-2 bg-white/10">{mockBookmarks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="lists" className="data-[state=active]:bg-emerald-600">
              <FolderOpen className="h-4 w-4 mr-2" />
              Reading Lists
              <Badge className="ml-2 bg-white/10">{mockReadingLists.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-emerald-600">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
              <Badge className="ml-2 bg-white/10">{mockAlerts.filter(a => a.active).length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-emerald-600">
              <Clock className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search bookmarks..."
                  className="pl-10 bg-white/5 border-white/20 text-white"
                />
              </div>
              <p className="text-white/60 text-sm">{mockBookmarks.length} saved publications</p>
            </div>

            <div className="space-y-4">
              {mockBookmarks.map((bookmark) => (
                <Card key={bookmark.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            {categoryLabels[bookmark.category] || bookmark.category}
                          </Badge>
                          <span className="text-sm text-white/40">{bookmark.year}</span>
                        </div>
                        <h3 className="font-medium text-white mb-1">{bookmark.title}</h3>
                        <p className="text-sm text-white/60">{bookmark.organization}</p>
                        <p className="text-xs text-white/40 mt-2">
                          Saved {bookmark.addedAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="text-white/60 hover:text-white">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-white/60 hover:text-red-400"
                          onClick={() => handleRemoveBookmark(bookmark.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reading Lists Tab */}
          <TabsContent value="lists" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Your Reading Lists</h2>
              <Button 
                onClick={() => setShowNewListForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New List
              </Button>
            </div>

            {showNewListForm && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Input
                      placeholder="List name..."
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="flex-1 bg-white/5 border-white/20 text-white"
                    />
                    <Button onClick={handleCreateList} className="bg-emerald-600">
                      Create
                    </Button>
                    <Button variant="ghost" onClick={() => setShowNewListForm(false)} className="text-white/60">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockReadingLists.map((list) => (
                <Card key={list.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <FolderOpen className="h-6 w-6 text-emerald-400" />
                      </div>
                      <Badge variant="outline" className="border-white/20 text-white/60">
                        {list.itemCount} items
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-white mb-1">{list.name}</h3>
                    <p className="text-sm text-white/60 mb-4">{list.description}</p>
                    <p className="text-xs text-white/40">
                      Created {list.createdAt.toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Research Alerts</h2>
                <p className="text-sm text-white/60">Get notified when new research matches your interests</p>
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                New Alert
              </Button>
            </div>

            <div className="space-y-4">
              {mockAlerts.map((alert) => (
                <Card key={alert.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${alert.active ? 'bg-emerald-500/10' : 'bg-white/5'}`}>
                          <Bell className={`h-5 w-5 ${alert.active ? 'text-emerald-400' : 'text-white/40'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white">{alert.query}</h3>
                            <Badge variant="outline" className="border-white/20 text-white/60 text-xs">
                              {alert.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-white/60 mt-1">
                            <span>Frequency: {alert.frequency}</span>
                            <span>Last triggered: {alert.lastTriggered.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant={alert.active ? "default" : "outline"}
                          onClick={() => handleToggleAlert(alert.id, alert.active)}
                          className={alert.active ? "bg-emerald-600" : "border-white/20 text-white/60"}
                        >
                          {alert.active ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Paused
                            </>
                          )}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white/60 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recently Viewed</h2>
              <Button variant="outline" size="sm" className="border-white/20 text-white/60">
                Clear History
              </Button>
            </div>

            <div className="space-y-4">
              {[...mockBookmarks].reverse().map((item, index) => (
                <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-white/5">
                        <FileText className="h-5 w-5 text-white/40" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{item.title}</h3>
                        <p className="text-sm text-white/60">{item.organization} • {item.year}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/40">
                          {index === 0 ? "Today" : index === 1 ? "Yesterday" : `${index + 1} days ago`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
