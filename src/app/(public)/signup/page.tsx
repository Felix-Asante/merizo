import { SignupForm } from "@/ui/sections/auth/signup-form";
import { AuthLayout } from "@/ui/shared/layouts/auth-layout";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      description="Join SplitNest to track shared expenses and settle bills with your household"
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Log in"
      contentClassName="max-w-xl"
    >
      <SignupForm />
    </AuthLayout>
  );
}
