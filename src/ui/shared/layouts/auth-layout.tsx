import { AppConfig } from "@/config/app-config";
import Link from "next/link";
import { ReactNode } from "react";
import { Logo } from "../logo";
import { cn } from "../../utils";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
  contentClassName?: string;
}

export function AuthLayout({
  children,
  title,
  description,
  footerText,
  footerLink,
  footerLinkText,
  contentClassName,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className={cn("w-full max-w-[420px]", contentClassName)}>
        <div className="text-center mb-10">
          <Logo />
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {AppConfig.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Track shared expenses with your household
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {children}

          {/* Footer link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{footerText} </span>
            <Link
              href={footerLink}
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              {footerLinkText}
            </Link>
          </div>
        </div>

        {/* Privacy link */}
        <div className="mt-6 text-center">
          <Link
            href="/privacy"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
