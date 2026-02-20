"use client";
import { Button } from "@/ui/base/button";
import { Form } from "@/ui/base/form";
import FormInput from "@/ui/shared/inputs/form-input";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  signupSchema,
  type SignupSchemaInput,
} from "@/adapters/validation/auth-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authService } from "@/services/auth/auth-service";
import { Logger } from "@/lib/logger";

const logger = new Logger("SignupForm");

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignupSchemaInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (data: SignupSchemaInput) => {
    setIsLoading(true);

    try {
      await authService.signup(data);
      toast.success("Account created successfully. You can now log in.");
      router.push("/login");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      const { name, email } = data;
      logger.error("Failed to sign up", err as Error, { name, email });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="gap-5 grid sm:grid-cols-2"
      >
        <FormInput
          name="name"
          label="Name"
          placeholder="Full Name"
          autoComplete="name"
        />
        <FormInput
          name="email"
          label="Email"
          placeholder="Email"
          autoComplete="email"
        />
        <FormInput
          name="password"
          label="Password"
          placeholder="Password"
          autoComplete="new-password"
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
        <FormInput
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm Password"
          autoComplete="new-password"
          type={showConfirmPassword ? "text" : "password"}
          endContent={
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </button>
          }
        />

        <div className="sm:col-span-2">
          <Button
            type="submit"
            className="w-full h-11 text-base font-medium"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <></>}
            {isLoading ? "Creating account..." : "Sign up"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
