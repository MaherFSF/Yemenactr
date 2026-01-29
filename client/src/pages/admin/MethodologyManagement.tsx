/**
 * MethodologyManagement - Admin page for managing methodology notes
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  BookOpen, 
  Plus, 
  Save,
  FileText,
  RefreshCw
} from "lucide-react";

const CATEGORIES = [
  { value: 'data_collection', labelEn: 'Data Collection', labelAr: 'جمع البيانات' },
  { value: 'contradiction_handling', labelEn: 'Contradiction Handling', labelAr: 'معالجة التناقضات' },
  { value: 'confidence_grades', labelEn: 'Confidence Grades', labelAr: 'درجات الثقة' },
  { value: 'revisions_vintages', labelEn: 'Revisions & Vintages', labelAr: 'المراجعات والإصدارات' },
  { value: 'uncertainty_interpretation', labelEn: 'Uncertainty Interpretation', labelAr: 'تفسير عدم اليقين' },
  { value: 'missing_data', labelEn: 'Missing Data', labelAr: 'البيانات المفقودة' },
  { value: 'data_licenses', labelEn: 'Data Licenses', labelAr: 'تراخيص البيانات' },
  { value: 'general', labelEn: 'General', labelAr: 'عام' }
];

export default function MethodologyManagement() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  const { data: notesData, isLoading, refetch } = trpc.sectorPages.getMethodologyNotes.useQuery({
    category: selectedCategory || undefined
  });
  
  const addNoteMutation = trpc.sectorPages.addMethodologyNote.useMutation({
    onSuccess: () => {
      toast.success(isArabic ? 'تمت إضافة الملاحظة' : 'Note added successfully');
      refetch();
      setAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const notes = notesData?.notes || [];

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isArabic ? 'إدارة المنهجية' : 'Methodology Management'}
            </h1>
            <p className="text-muted-foreground">
              {isArabic ? 'إدارة ملاحظات المنهجية والتوثيق' : 'Manage methodology notes and documentation'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {isArabic ? 'تحديث' : 'Refresh'}
            </Button>
            <AddNoteDialog 
              isArabic={isArabic} 
              open={addDialogOpen}
              onOpenChange={setAddDialogOpen}
              onSave={(data) => addNoteMutation.mutate(data)}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant={selectedCategory === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('')}
          >
            {isArabic ? 'الكل' : 'All'}
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
            >
              {isArabic ? cat.labelAr : cat.labelEn}
            </Button>
          ))}
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : notes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {isArabic ? 'لا توجد ملاحظات منهجية' : 'No methodology notes found'}
              </p>
              <Button className="mt-4" onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {isArabic ? 'إضافة ملاحظة' : 'Add Note'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note: any) => (
              <Card key={note.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                      {isArabic ? note.titleAr : note.titleEn}
                    </CardTitle>
                    <Badge variant={note.isPublished ? 'default' : 'outline'}>
                      {note.isPublished 
                        ? (isArabic ? 'منشور' : 'Published')
                        : (isArabic ? 'مسودة' : 'Draft')
                      }
                    </Badge>
                  </div>
                  <CardDescription>
                    {CATEGORIES.find(c => c.value === note.category)?.[isArabic ? 'labelAr' : 'labelEn'] || note.category}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {isArabic ? note.contentAr : note.contentEn}
                  </p>
                  {note.sectorCode && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {note.sectorCode}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function AddNoteDialog({ isArabic, open, onOpenChange, onSave }: { 
  isArabic: boolean; 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    titleEn: '',
    titleAr: '',
    contentEn: '',
    contentAr: '',
    category: 'general',
    sectorCode: '',
    isPublished: false
  });

  const handleSave = () => {
    onSave({
      ...formData,
      sectorCode: formData.sectorCode || undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {isArabic ? 'إضافة ملاحظة' : 'Add Note'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isArabic ? 'إضافة ملاحظة منهجية' : 'Add Methodology Note'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{isArabic ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
              <Input 
                value={formData.titleEn} 
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                placeholder="e.g., How We Handle Missing Data"
              />
            </div>
            <div>
              <Label>{isArabic ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
              <Input 
                value={formData.titleAr} 
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                dir="rtl"
                placeholder="مثال: كيف نتعامل مع البيانات المفقودة"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{isArabic ? 'المحتوى (إنجليزي)' : 'Content (English)'}</Label>
              <Textarea 
                value={formData.contentEn} 
                onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                rows={6}
                placeholder="Detailed explanation..."
              />
            </div>
            <div>
              <Label>{isArabic ? 'المحتوى (عربي)' : 'Content (Arabic)'}</Label>
              <Textarea 
                value={formData.contentAr} 
                onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
                rows={6}
                dir="rtl"
                placeholder="شرح مفصل..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{isArabic ? 'الفئة' : 'Category'}</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {isArabic ? cat.labelAr : cat.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{isArabic ? 'رمز القطاع (اختياري)' : 'Sector Code (Optional)'}</Label>
              <Input 
                value={formData.sectorCode} 
                onChange={(e) => setFormData({ ...formData, sectorCode: e.target.value })}
                placeholder="e.g., currency_fx"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch 
              checked={formData.isPublished}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
            />
            <Label>{isArabic ? 'نشر فوراً' : 'Publish immediately'}</Label>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isArabic ? 'حفظ الملاحظة' : 'Save Note'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
