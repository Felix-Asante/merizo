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
} from "@/validation/group-validation";
import { generateGroupCode } from "@/utils/group/code-generator";
import { GroupNavbar } from "./group-navbar";
import { GroupDetailsSection } from "./group-details-section";
import { InviteMembersSection } from "./invite-members-section";
import { CreateGroupSubmitButton } from "./submit-button";
import { createOrganization } from "@/services/organizations/organization-service-server";
import { useMutation } from "@tanstack/react-query";
import { slugify } from "@/utils";
import { setActiveOrganizationClient } from "@/services/organizations/organization-service-client";

export function CreateGroup() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  const groupCode = useMemo(() => generateGroupCode(), []);

  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      type: undefined,
      currency: "MAD",
      memberEmails: [],
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: createOrganization,
  });

  const handleSubmit = async (data: CreateGroupFormValues) => {
    try {
      const result = await createGroupMutation.mutateAsync({
        name: data.name,
        slug: slugify(data.name),
        inviteCode: groupCode,
        currency: data.currency,
        type: data.type,
      });
      if (result.error || !result.success) {
        toast.error("Failed to create group. Please try again.");
        return;
      }
      setIsSuccess(true);
      toast.success("Group created successfully!");
      if (result.data) {
        await setActiveOrganizationClient(result.data.id);
      }
      form.reset();
      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch {
      toast.error("Failed to create group. Please try again.");
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
            isLoading={createGroupMutation.isPending}
            isSuccess={isSuccess}
          />
        </form>
      </Form>
    </motion.div>
  );
}
