import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  MapPin, 
  Phone, 
  Send,
  Building2,
  Globe
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success(
      language === "ar" 
        ? "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً."
        : "Your message has been sent successfully! We'll get back to you soon."
    );

    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {language === "ar" ? "تواصل معنا" : "Contact Us"}
            </h1>
            <p className="text-xl text-muted-foreground">
              {language === "ar"
                ? "نحن هنا للإجابة على أسئلتكم ومساعدتكم في الوصول إلى البيانات الاقتصادية التي تحتاجونها"
                : "We're here to answer your questions and help you access the economic data you need"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "أرسل لنا رسالة" : "Send Us a Message"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "املأ النموذج أدناه وسنتواصل معك في أقرب وقت ممكن"
                    : "Fill out the form below and we'll get back to you as soon as possible"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {language === "ar" ? "الاسم" : "Name"}
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder={language === "ar" ? "أدخل اسمك" : "Enter your name"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {language === "ar" ? "البريد الإلكتروني" : "Email"}
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder={language === "ar" ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      {language === "ar" ? "الموضوع" : "Subject"}
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder={language === "ar" ? "ما هو موضوع رسالتك؟" : "What is your message about?"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      {language === "ar" ? "الرسالة" : "Message"}
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder={language === "ar" ? "اكتب رسالتك هنا..." : "Write your message here..."}
                    />
                  </div>

                  <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                    <Send className="h-4 w-4" />
                    {isSubmitting 
                      ? (language === "ar" ? "جاري الإرسال..." : "Sending...")
                      : (language === "ar" ? "إرسال الرسالة" : "Send Message")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "معلومات الاتصال" : "Contact Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">
                      {language === "ar" ? "البريد الإلكتروني" : "Email"}
                    </p>
                    <a 
                      href="mailto:yeto@causewaygrp.com" 
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      yeto@causewaygrp.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">
                      {language === "ar" ? "الموقع" : "Location"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" ? "عدن، اليمن" : "Aden, Yemen"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">
                      {language === "ar" ? "المؤسسة" : "Organization"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      CauseWay Financial & Banking Consultancies
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">
                      {language === "ar" ? "المواقع الأخرى" : "Other Locations"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Cairo (HQ) | Tallinn | Geneva
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === "ar" ? "للاستفسارات المؤسسية" : "For Institutional Inquiries"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === "ar"
                    ? "إذا كنت تمثل منظمة حكومية أو دولية أو مؤسسة بحثية، يرجى التواصل معنا مباشرة للحصول على وصول مخصص ودعم متخصص."
                    : "If you represent a government agency, international organization, or research institution, please contact us directly for dedicated access and specialized support."}
                </p>
                <Button variant="outline" className="w-full">
                  {language === "ar" ? "طلب وصول مؤسسي" : "Request Institutional Access"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
