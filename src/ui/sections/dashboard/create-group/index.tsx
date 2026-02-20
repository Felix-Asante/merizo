"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Form } from "@/ui/base/form";
import {
  createGroupSchema,
  type CreateGroupFormValues,
} from "@/adapters/validation/group-validation";
import { generateGroupCode } from "@/utils/group/code-generator";
import { GroupNavbar } from "./group-navbar";
import { GroupDetailsSection } from "./group-details-section";
import { InviteMembersSection } from "./invite-members-section";
import { CreateGroupSubmitButton } from "./submit-button";

export function CreateGroup() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const groupCode = useMemo(() => generateGroupCode(), []);

  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      type: undefined,
      currency: "USD",
      memberEmails: [],
    },
  });

  const handleSubmit = async (data: CreateGroupFormValues) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log("Group created:", { ...data, inviteCode: groupCode });
      setIsSuccess(true);
      toast.success("Group created successfully!");
      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch {
      toast.error("Failed to create group. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="max-w-2xl mx-auto"
    >
      <GroupNavbar />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <GroupDetailsSection />
          <InviteMembersSection groupCode={groupCode} />
          <CreateGroupSubmitButton
            isLoading={isLoading}
            isSuccess={isSuccess}
          />
        </form>
      </Form>
    </motion.div>
  );
}
