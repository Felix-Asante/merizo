"use client";

import { Form } from "@/ui/base/form";
import FormInput from "@/ui/shared/inputs/form-input";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/ui/base/button";
import Link from "next/link";
import type { LoginSchemaInput } from "@/adapters/validation/auth-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/adapters/validation/auth-validation";
import { toast } from "sonner";
import { authService } from "@/services/auth/auth-service";
import { Logger } from "@/lib/logger";
import { Spinner } from "@/ui/base/spinner";

const logger = new Logger("LoginForm");

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: LoginSchemaInput) => {
    setIsLoading(true);

    try {
      await authService.login(data);
      router.push("/");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      logger.error("Failed to login", err as Error, { data });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <FormInput
          name="email"
          label="Email"
          placeholder="Email"
          startContent={
            <MailIcon className="size-4 text-muted-foreground pointer-events-none" />
          }
        />
        <FormInput
          name="password"
          label="Password"
          placeholder="Password"
          startContent={
            <LockIcon className="size-4 text-muted-foreground pointer-events-none" />
          }
          type={showPassword ? "text" : "password"}
          endContent={
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </button>
          }
        />

        <div>
          <Button
            type="submit"
            className="w-full h-11 text-base font-medium"
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : <></>}
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
          <div className="flex justify-center mt-2">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
