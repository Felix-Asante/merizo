"use client";
"use memo";
import { setActiveGroupClient } from "@/services/groups/groups-service-client";
import { createGroup } from "@/services/groups/groups-service-server";
import { Form } from "@/ui/base/form";
import { generateRandomString, slugify } from "@/utils";
import { generateGroupCode } from "@/utils/group/code-generator";
import {
  createGroupSchema,
  type CreateGroupFormValues,
} from "@/validation/group-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { GroupDetailsSection } from "./group-details-section";
import { GroupNavbar } from "./group-navbar";
import { InviteMembersSection } from "./invite-members-section";
import { CreateGroupSubmitButton } from "./submit-button";
import { Logger } from "@/lib/logger";

const logger = new Logger("CreateGroupPage");

export function CreateGroup() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  const groupCode = generateGroupCode();

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
    mutationFn: createGroup,
  });

  const handleSubmit = async (data: CreateGroupFormValues) => {
    const slug =
      `${slugify(data.name)}-${generateRandomString(4)}`.toLowerCase();
    const payload = {
      name: data.name,
      slug: slug,
      inviteCode: groupCode,
      currency: data.currency,
      type: data.type,
    };
    try {
      const result = await createGroupMutation.mutateAsync(payload);
      if (result.error || !result.success) {
        toast.error("Failed to create group. Please try again.");
        logger.error("Failed to create group", result.error as Error, {
          payload,
        });
        return;
      }
      setIsSuccess(true);
      toast.success("Group created successfully!");
      if (result.data) {
        await setActiveGroupClient(result.data.id);
      }
      form.reset();
      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (error) {
      toast.error("Failed to create group. Please try again.");
      logger.error("Failed to create group", error as Error, { payload });
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
