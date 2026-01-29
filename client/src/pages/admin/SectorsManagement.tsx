/**
 * SectorsManagement - Admin page for managing sector definitions and release gates
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Settings, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Edit, 
  Eye,
  RefreshCw,
  Plus,
  Save
} from "lucide-react";

export default function SectorsManagement() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { data: sectorsData, isLoading: sectorsLoading, refetch: refetchSectors } = trpc.sectorPages.getAllSectors.useQuery();
  const { data: gatesData, isLoading: gatesLoading, refetch: refetchGates } = trpc.sectorPages.getAllReleaseGates.useQuery();
  
  const updateSectorMutation = trpc.sectorPages.updateSectorDefinition.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? 'تم تحديث القطاع بنجاح' : 'Sector updated successfully');
      refetchSectors();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const updateGateMutation = trpc.sectorPages.updateReleaseGate.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? 'تم تحديث بوابة الإصدار' : 'Release gate updated');
      refetchGates();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const sectors = sectorsData?.sectors || [];
  const gates = gatesData?.gates || [];

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isArabic ? 'إدارة القطاعات' : 'Sectors Management'}
            </h1>
            <p className="text-muted-foreground">
              {isArabic ? 'إدارة تعريفات القطاعات وبوابات الإصدار' : 'Manage sector definitions and release gates'}
            </p>
          </div>
          <Button onClick={() => { refetchSectors(); refetchGates(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {isArabic ? 'تحديث' : 'Refresh'}
          </Button>
        </div>

        <Tabs defaultValue="sectors">
          <TabsList>
            <TabsTrigger value="sectors">
              {isArabic ? 'القطاعات' : 'Sectors'} ({sectors.length})
            </TabsTrigger>
            <TabsTrigger value="gates">
              {isArabic ? 'بوابات الإصدار' : 'Release Gates'}
            </TabsTrigger>
          </TabsList>

          {/* Sectors Tab */}
          <TabsContent value="sectors" className="space-y-4">
            {sectorsLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectors.map((sector: any) => (
                  <Card key={sector.sectorCode} className="relative">
                    <div 
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
                      style={{ backgroundColor: sector.heroColor }}
                    />
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">
                          {isArabic ? sector.nameAr : sector.nameEn}
                        </CardTitle>
                        <div className="flex gap-1">
                          {sector.isPublished ? (
                            <Badge className="bg-green-100 text-green-800">
                              {isArabic ? 'منشور' : 'Published'}
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              {isArabic ? 'مسودة' : 'Draft'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription className="text-xs">
                        {sector.sectorCode}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {isArabic ? sector.missionAr : sector.missionEn}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {isArabic ? 'الترتيب:' : 'Order:'} {sector.displayOrder}
                          </span>
                          {sector.hasRegimeSplit && (
                            <Badge variant="secondary" className="text-xs">
                              {isArabic ? 'منقسم' : 'Split'}
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(`/sectors/${sector.sectorCode}`, '_blank')}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {isArabic ? 'عرض' : 'View'}
                          </Button>
                          <SectorEditDialog 
                            sector={sector} 
                            isArabic={isArabic}
                            onSave={(updates) => updateSectorMutation.mutate({ sectorCode: sector.sectorCode, updates })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Release Gates Tab */}
          <TabsContent value="gates" className="space-y-4">
            {gatesLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="space-y-4">
                {sectors.map((sector: any) => {
                  const gate = gates.find((g: any) => g.sectorCode === sector.sectorCode);
                  return (
                    <ReleaseGateCard
                      key={sector.sectorCode}
                      sector={sector}
                      gate={gate}
                      isArabic={isArabic}
                      onUpdate={(updates) => updateGateMutation.mutate({ sectorCode: sector.sectorCode, ...updates })}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Sector Edit Dialog
function SectorEditDialog({ sector, isArabic, onSave }: { sector: any; isArabic: boolean; onSave: (updates: any) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nameEn: sector.nameEn,
    nameAr: sector.nameAr,
    missionEn: sector.missionEn,
    missionAr: sector.missionAr,
    displayOrder: sector.displayOrder,
    heroColor: sector.heroColor,
    hasRegimeSplit: sector.hasRegimeSplit,
    isActive: sector.isActive,
    isPublished: sector.isPublished
  });

  const handleSave = () => {
    onSave(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit className="h-3 w-3 mr-1" />
          {isArabic ? 'تعديل' : 'Edit'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isArabic ? 'تعديل القطاع' : 'Edit Sector'}: {sector.sectorCode}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{isArabic ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
              <Input 
                value={formData.nameEn} 
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              />
            </div>
            <div>
              <Label>{isArabic ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
              <Input 
                value={formData.nameAr} 
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                dir="rtl"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{isArabic ? 'المهمة (إنجليزي)' : 'Mission (English)'}</Label>
              <Textarea 
                value={formData.missionEn} 
                onChange={(e) => setFormData({ ...formData, missionEn: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label>{isArabic ? 'المهمة (عربي)' : 'Mission (Arabic)'}</Label>
              <Textarea 
                value={formData.missionAr} 
                onChange={(e) => setFormData({ ...formData, missionAr: e.target.value })}
                rows={3}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>{isArabic ? 'الترتيب' : 'Display Order'}</Label>
              <Input 
                type="number"
                value={formData.displayOrder} 
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>{isArabic ? 'لون الهيدر' : 'Hero Color'}</Label>
              <Input 
                type="color"
                value={formData.heroColor} 
                onChange={(e) => setFormData({ ...formData, heroColor: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch 
                checked={formData.hasRegimeSplit}
                onCheckedChange={(checked) => setFormData({ ...formData, hasRegimeSplit: checked })}
              />
              <Label>{isArabic ? 'بيانات منقسمة' : 'Regime Split'}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>{isArabic ? 'نشط' : 'Active'}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={formData.isPublished}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
              />
              <Label>{isArabic ? 'منشور' : 'Published'}</Label>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Release Gate Card
function ReleaseGateCard({ sector, gate, isArabic, onUpdate }: { sector: any; gate: any; isArabic: boolean; onUpdate: (updates: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    evidenceCoveragePercent: gate?.evidenceCoveragePercent || 0,
    evidenceCoveragePassed: gate?.evidenceCoveragePassed || false,
    exportsWorking: gate?.exportsWorking || false,
    contradictionsVisible: gate?.contradictionsVisible || false,
    bilingualParityPassed: gate?.bilingualParityPassed || false,
    noPlaceholdersPassed: gate?.noPlaceholdersPassed || false,
    notes: gate?.notes || ''
  });

  const allPassed = formData.evidenceCoveragePassed && formData.exportsWorking && 
    formData.contradictionsVisible && formData.bilingualParityPassed && formData.noPlaceholdersPassed;

  const handleSave = () => {
    onUpdate(formData);
    setEditing(false);
  };

  return (
    <Card className={allPassed ? 'border-green-500' : 'border-yellow-500'}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: sector.heroColor }}
            />
            <CardTitle className="text-lg">
              {isArabic ? sector.nameAr : sector.nameEn}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {allPassed ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {isArabic ? 'جاهز للنشر' : 'Ready to Publish'}
              </Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {isArabic ? 'يحتاج مراجعة' : 'Needs Review'}
              </Badge>
            )}
            <Button size="sm" variant="outline" onClick={() => setEditing(!editing)}>
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <GateCheckbox
            label={isArabic ? 'تغطية الأدلة ≥95%' : 'Evidence ≥95%'}
            checked={formData.evidenceCoveragePassed}
            onChange={(checked) => editing && setFormData({ ...formData, evidenceCoveragePassed: checked })}
            disabled={!editing}
          />
          <GateCheckbox
            label={isArabic ? 'التصدير يعمل' : 'Exports Working'}
            checked={formData.exportsWorking}
            onChange={(checked) => editing && setFormData({ ...formData, exportsWorking: checked })}
            disabled={!editing}
          />
          <GateCheckbox
            label={isArabic ? 'التناقضات ظاهرة' : 'Contradictions Visible'}
            checked={formData.contradictionsVisible}
            onChange={(checked) => editing && setFormData({ ...formData, contradictionsVisible: checked })}
            disabled={!editing}
          />
          <GateCheckbox
            label={isArabic ? 'تكافؤ ثنائي اللغة' : 'Bilingual Parity'}
            checked={formData.bilingualParityPassed}
            onChange={(checked) => editing && setFormData({ ...formData, bilingualParityPassed: checked })}
            disabled={!editing}
          />
          <GateCheckbox
            label={isArabic ? 'لا عناصر نائبة' : 'No Placeholders'}
            checked={formData.noPlaceholdersPassed}
            onChange={(checked) => editing && setFormData({ ...formData, noPlaceholdersPassed: checked })}
            disabled={!editing}
          />
        </div>

        {editing && (
          <div className="mt-4 space-y-3">
            <div>
              <Label>{isArabic ? 'نسبة تغطية الأدلة' : 'Evidence Coverage %'}</Label>
              <Input 
                type="number"
                value={formData.evidenceCoveragePercent}
                onChange={(e) => setFormData({ ...formData, evidenceCoveragePercent: parseFloat(e.target.value) })}
                min={0}
                max={100}
              />
            </div>
            <div>
              <Label>{isArabic ? 'ملاحظات' : 'Notes'}</Label>
              <Textarea 
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {isArabic ? 'حفظ' : 'Save'}
            </Button>
          </div>
        )}

        {gate?.lastCheckedAt && (
          <p className="text-xs text-muted-foreground mt-2">
            {isArabic ? 'آخر فحص:' : 'Last checked:'} {new Date(gate.lastCheckedAt).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function GateCheckbox({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (checked: boolean) => void; disabled: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer ${
          checked ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
        } ${disabled ? 'opacity-60' : ''}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        {checked && <CheckCircle2 className="h-3 w-3" />}
      </div>
      <span className="text-xs">{label}</span>
    </div>
  );
}
