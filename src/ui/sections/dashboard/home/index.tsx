"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SummaryBalanceCard } from "./summary-balance-card";
import { QuickActions } from "./quick-actions";
import { ActivityFeed } from "./activity-feed";
import { GroupSwitcher } from "./group-switcher";
import { NoGroupView } from "./no-group-view";
import { JoinGroupModal } from "./join-group-modal";
import { InviteMembersModal } from "@/ui/shared/invite-members-modal";
import { DashboardShimmer } from "./dashboard-shimmer";
import { DUMMY_GROUP_DATA, type Group } from "./dummy-data";
import {
  getActiveOrganization,
  setActiveOrganizationClient,
} from "@/services/organizations/organization-service-client";
import type { UserOrganization } from "@/types/organization";
import { toast } from "sonner";
import { Logger } from "@/lib/logger";
import { joinOrganizationWithCode } from "@/services/organizations/organization-service-server";

interface DashboardHomeProps {
  organizations: UserOrganization[];
}

const logger = new Logger("DashboardHome");

export function DashboardHome({ organizations }: DashboardHomeProps) {
  const router = useRouter();

  const { data: activeOrganization } = getActiveOrganization();
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleGroupChange = useCallback((groupId: string) => {
    try {
      if (groupId === activeOrganization?.id) return;
      setIsTransitioning(true);
      setTimeout(async () => {
        await setActiveOrganizationClient(groupId);
        setIsTransitioning(false);
      }, 250);
    } catch (error) {
      toast.error("Failed to set active group. Please try again.");
      logger.error("Failed to set active group", error as Error, { groupId });
    }
  }, []);

  const handleJoinGroup = useCallback(
    async (code: string) => {
      const results = await joinOrganizationWithCode(code);
      if (results.error || !results.success) {
        toast.error("Invalid code or you're already in this group.");
        logger.error(
          "Failed to join group",
          (results.error ?? new Error("Unknown")) as Error,
          { code },
        );
        throw new Error(
          results.error instanceof Error
            ? results.error.message
            : "Failed to join",
        );
      }
      if (results.data) {
        router.refresh();
        await setActiveOrganizationClient(results.data.organizationId);
      }
    },
    [router],
  );

  const handleCreateGroup = useCallback(() => {
    router.push("/groups/create");
  }, [router]);

  if (organizations.length === 0) {
    return (
      <>
        <NoGroupView
          onCreateGroup={handleCreateGroup}
          onJoinGroup={() => setJoinModalOpen(true)}
        />
        <JoinGroupModal
          open={joinModalOpen}
          onClose={() => setJoinModalOpen(false)}
          onJoin={handleJoinGroup}
        />
      </>
    );
  }

  const activeGroup = organizations.find(
    (g) => g.id === activeOrganization?.id,
  );
  const groupData = activeGroup ? DUMMY_GROUP_DATA[activeGroup.id] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-y-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">Welcome back, Felix</h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s your expense summary
          </p>
        </div>
        <GroupSwitcher
          groups={organizations}
          activeGroupId={activeOrganization?.id!}
          onGroupChange={handleGroupChange}
          onCreateGroup={handleCreateGroup}
          onJoinGroup={() => setJoinModalOpen(true)}
        />
      </div>

      <AnimatePresence mode="wait">
        {isTransitioning ? (
          <DashboardShimmer key="shimmer" />
        ) : groupData ? (
          <motion.div
            key={activeOrganization?.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <SummaryBalanceCard
              totalBalance={
                groupData.balance.youAreOwed - groupData.balance.youOwe
              }
              youOwe={groupData.balance.youOwe}
              youAreOwed={groupData.balance.youAreOwed}
            />
            <QuickActions
              activeGroupId={activeOrganization?.id!}
              onInvite={() => setInviteModalOpen(true)}
            />
            <ActivityFeed activities={groupData.activities} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <JoinGroupModal
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onJoin={handleJoinGroup}
      />

      {activeGroup && (
        <InviteMembersModal
          open={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          groupName={activeOrganization?.name ?? ""}
          inviteCode={activeOrganization?.inviteCode ?? ""}
        />
      )}
    </motion.div>
  );
}
