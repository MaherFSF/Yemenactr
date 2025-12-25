import { useLanguage } from "@/contexts/LanguageContext";
import { Mail } from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-secondary/30 mt-auto">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Contact Information */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{t("footer.contact")}:</span>
            <a
              href="mailto:yeto@causewaygrp.com"
              className="text-primary hover:underline font-medium"
            >
              {t("footer.email")}
            </a>
          </div>

          {/* Copyright & Branding */}
          <div className="flex flex-col items-center md:items-end gap-1 text-sm text-muted-foreground text-center md:text-right">
            <p>{t("footer.copyright")}</p>
            <p>
              {t("footer.poweredBy")}{" "}
              <span className="font-semibold text-foreground">
                {t("footer.causeway")}
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
