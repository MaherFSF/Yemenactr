import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  MapPin, 
  Phone, 
  Send,
  Globe
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // Anti-spam honeypot field

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Anti-spam: if honeypot field is filled, it's a bot
    if (honeypot) {
      console.log('[Contact] Spam detected via honeypot');
      toast.success(
        language === "ar" 
          ? "تم إرسال رسالتك بنجاح!"
          : "Your message has been sent successfully!"
      );
      return; // Silently reject spam
    }
    
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success(
      language === "ar" 
        ? "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً."
        : "Your message has been sent successfully! We'll get back to you soon."
    );

    setFormData({ name: "", organization: "", email: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Office locations for the map
  const offices = [
    { 
      city: language === "ar" ? "عدن، اليمن" : "Aden, Yemen", 
      type: language === "ar" ? "المقر الرئيسي" : "Headquarters",
      isMain: true
    },
    { 
      city: language === "ar" ? "القاهرة، مصر" : "Cairo, Egypt", 
      type: language === "ar" ? "المكتب الإقليمي" : "Regional Office",
      isMain: false
    },
    { 
      city: language === "ar" ? "جنيف وتالين" : "Geneva & Tallinn", 
      type: language === "ar" ? "مخطط 2026" : "Planned 2026",
      isMain: false
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* CauseWay Contact Page - Split Layout matching mockup */}
      <div className="flex-1 grid lg:grid-cols-2">
        {/* Left Side - Map and Locations (Light background) */}
        <div className="bg-[#F8F9F7] p-8 lg:p-16 flex flex-col justify-center">
          {/* World Map SVG with office markers */}
          <div className="relative mb-8">
            <svg viewBox="0 0 800 400" className="w-full h-auto opacity-60">
              {/* Simplified world map outline */}
              <path
                d="M50,200 Q100,150 150,180 Q200,160 250,170 Q300,150 350,160 Q400,140 450,150 Q500,130 550,140 Q600,120 650,130 Q700,110 750,120 L750,280 Q700,290 650,280 Q600,300 550,290 Q500,310 450,300 Q400,320 350,310 Q300,330 250,320 Q200,340 150,330 Q100,350 50,340 Z"
                fill="#768064"
                opacity="0.3"
              />
              {/* North America */}
              <ellipse cx="150" cy="180" rx="80" ry="60" fill="#768064" opacity="0.25" />
              {/* South America */}
              <ellipse cx="200" cy="300" rx="40" ry="70" fill="#768064" opacity="0.25" />
              {/* Europe */}
              <ellipse cx="420" cy="160" rx="60" ry="40" fill="#768064" opacity="0.25" />
              {/* Africa */}
              <ellipse cx="430" cy="260" rx="50" ry="70" fill="#768064" opacity="0.25" />
              {/* Asia */}
              <ellipse cx="580" cy="180" rx="100" ry="60" fill="#768064" opacity="0.25" />
              {/* Australia */}
              <ellipse cx="680" cy="320" rx="40" ry="30" fill="#768064" opacity="0.25" />
              
              {/* Office Markers */}
              {/* Aden, Yemen - Headquarters (Gold diamond) */}
              <g transform="translate(480, 240)">
                <rect x="-8" y="-8" width="16" height="16" fill="#C9A227" transform="rotate(45)" />
                <text x="15" y="5" fontSize="10" fill="#2C3424" fontWeight="500">Aden, Yemen</text>
                <text x="15" y="16" fontSize="8" fill="#768064">(Headquarters)</text>
              </g>
              
              {/* Cairo, Egypt - Regional Office (Gold diamond) */}
              <g transform="translate(450, 220)">
                <rect x="-6" y="-6" width="12" height="12" fill="#C9A227" transform="rotate(45)" />
                <text x="12" y="3" fontSize="9" fill="#2C3424" fontWeight="500">Cairo, Egypt</text>
                <text x="12" y="13" fontSize="7" fill="#768064">(Regional Office)</text>
              </g>
              
              {/* Geneva - Planned 2026 (Outline marker) */}
              <g transform="translate(410, 155)">
                <circle cx="0" cy="0" r="6" fill="none" stroke="#959581" strokeWidth="2" />
                <text x="10" y="3" fontSize="8" fill="#959581">Geneva</text>
                <text x="10" y="12" fontSize="7" fill="#959581">(Planned 2026)</text>
              </g>
              
              {/* Tallinn - Planned 2026 (Outline marker) */}
              <g transform="translate(440, 130)">
                <circle cx="0" cy="0" r="6" fill="none" stroke="#959581" strokeWidth="2" />
                <text x="10" y="3" fontSize="8" fill="#959581">Tallinn</text>
                <text x="10" y="12" fontSize="7" fill="#959581">(Planned 2026)</text>
              </g>
            </svg>
          </div>

          {/* Office Locations List */}
          <div className="space-y-3">
            {offices.map((office, index) => (
              <div key={index} className="flex items-center gap-3">
                {office.isMain ? (
                  <div className="w-3 h-3 bg-[#C9A227] transform rotate-45" />
                ) : (
                  <div className="w-3 h-3 border-2 border-[#959581] rounded-full" />
                )}
                <span className={`text-lg ${office.isMain ? 'font-semibold text-[#2C3424]' : 'text-[#768064]'}`}>
                  {office.city} <span className="text-sm">({office.type})</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Contact Form (Dark green background) */}
        <div className="bg-[#2C3424] p-8 lg:p-16 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-8">
            {language === "ar" ? "تواصل معنا" : "Get in Touch"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder={language === "ar" ? "الاسم" : "Name"}
              className="bg-transparent border-[#768064] text-white placeholder:text-[#959581] focus:border-[#C9A227] h-12"
            />
            
            <Input
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              placeholder={language === "ar" ? "المؤسسة" : "Organization"}
              className="bg-transparent border-[#768064] text-white placeholder:text-[#959581] focus:border-[#C9A227] h-12"
            />
            
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder={language === "ar" ? "البريد الإلكتروني" : "Email"}
              className="bg-transparent border-[#768064] text-white placeholder:text-[#959581] focus:border-[#C9A227] h-12"
            />
            
            <Textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              placeholder={language === "ar" ? "الرسالة" : "Message"}
              className="bg-transparent border-[#768064] text-white placeholder:text-[#959581] focus:border-[#C9A227] resize-none"
            />

            {/* Honeypot anti-spam field - hidden from users, visible to bots */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <Input
                name="website"
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#C9A227] hover:bg-[#B8931F] text-[#2C3424] font-semibold h-12 text-base"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (language === "ar" ? "جاري الإرسال..." : "Sending...")
                : (language === "ar" ? "إرسال الرسالة" : "Send Message")}
            </Button>
          </form>

          {/* Contact Details */}
          <div className="mt-10 space-y-3 text-[#DADED8]">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-[#C9A227]" />
              <span>+967 2 236655</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-[#C9A227]" />
              <a href="mailto:info@causewaygrp.com" className="hover:text-[#C9A227] transition-colors">
                info@causewaygrp.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-[#C9A227]" />
              <a href="https://www.causewaygrp.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A227] transition-colors">
                www.causewaygrp.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
