"use client";

import { Form } from "@/ui/base/form";
import FormInput from "@/ui/shared/inputs/form-input";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/ui/base/button";
import Link from "next/link";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  const handleSubmit = async (data: any) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-5">
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
          <Button type="submit" className="w-full h-11 text-base font-medium">
            Log in
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
