"use client";
import { Button } from "@/ui/base/button";
import { Form } from "@/ui/base/form";
import FormInput from "@/ui/shared/inputs/form-input";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (data: any) => {
    console.log(data);

    setIsLoading(true);

    try {
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="gap-5 grid sm:grid-cols-2"
      >
        <FormInput name="name" label="Name" placeholder="Full Name" />
        <FormInput name="email" label="Email" placeholder="Email" />
        <FormInput
          name="password"
          label="Password"
          placeholder="Password"
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
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign up"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
