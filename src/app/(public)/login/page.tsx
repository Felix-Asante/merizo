"use client";

import { LoginForm } from "@/ui/sections/auth/login-form";
import { AuthLayout } from "@/ui/shared/layouts/auth-layout";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your credentials to continue to your account"
      footerText="Don't have an account?"
      footerLink="/signup"
      footerLinkText="Sign up"
    >
      <LoginForm />
    </AuthLayout>
  );
}
