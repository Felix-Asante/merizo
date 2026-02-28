"use client";
"use memo";

import { Logger } from "@/lib/logger";
import { getDashboardData } from "@/services/dashboard/dashboard-actions";
import {
  getActiveGroup,
  setActiveGroupClient,
} from "@/services/groups/groups-service-client";
import {
  joinGroupWithCode,
  setActiveGroup,
} from "@/services/groups/groups-service-server";
import type { DashboardData } from "@/types";
import type { UserGroup } from "@/types/groups";
import { Button } from "@/ui/base/button";
import { InviteMembersModal } from "@/ui/shared/invite-members-modal";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { ActivityFeed } from "./activity-feed";
import { DashboardShimmer } from "./dashboard-shimmer";
import { GroupSwitcher } from "./group-switcher";
import { JoinGroupModal } from "./join-group-modal";
import { NoGroupView } from "./no-group-view";
import { QuickActions } from "./quick-actions";
import { SummaryBalanceCard } from "./summary-balance-card";

interface DashboardHomeProps {
  groups: UserGroup[];
  initialData: DashboardData | null;
}

const logger = new Logger("DashboardHome");

export function DashboardHome({ groups, initialData }: DashboardHomeProps) {
  const router = useRouter();

  const { data: activeGroup } = getActiveGroup();
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [isTransitioning, startTransition] = useTransition();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    initialData,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDashboardData(initialData);
    setError(null);
  }, [initialData]);

  const fetchDashboardData = async (groupId: string) => {
    setError(null);
    const result = await getDashboardData(groupId);
    if (result.error || !result.data) {
      setError(result.error ?? "Failed to load data");
      setDashboardData(null);
    } else {
      setDashboardData(result.data);
    }
  };

  const handleGroupChange = async (groupId: string) => {
    try {
      if (groupId === activeGroup?.id) return;

      startTransition(async () => {
        try {
          setDashboardData(null);
          setError(null);
          await Promise.all([
            setActiveGroupClient(groupId),
            setActiveGroup(groupId),
            fetchDashboardData(groupId),
          ]);
        } catch (err) {
          toast.error("Failed to set active group. Please try again.");
          logger.error("Failed to set active group", err as Error, { groupId });
        }
      });
    } catch (err) {
      toast.error("Failed to set active group. Please try again.");
      logger.error("Failed to set active group", err as Error, { groupId });
    }
  };

  const handleJoinGroup = async (code: string) => {
    const results = await joinGroupWithCode(code);
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
      await setActiveGroupClient(results.data.groupId);
      await fetchDashboardData(results.data.groupId);
    }
  };

  if (groups.length === 0) {
    return (
      <>
        <NoGroupView
          onCreateGroup={() => router.push("/create-group")}
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

  const userName = dashboardData?.userName ?? "there";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-y-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            Welcome back, {userName.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s your expense summary
          </p>
        </div>
        <GroupSwitcher
          groups={groups}
          activeGroupId={activeGroup?.id!}
          onGroupChange={handleGroupChange}
          onCreateGroup={() => router.push("/create-group")}
          onJoinGroup={() => setJoinModalOpen(true)}
        />
      </div>

      <AnimatePresence mode="wait">
        {isTransitioning ? (
          <DashboardShimmer key="shimmer" />
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl bg-card border border-destructive/20 p-8 flex flex-col items-center text-center"
          >
            <div className="flex items-center justify-center size-12 rounded-full bg-destructive/10 mb-3">
              <AlertCircleIcon className="size-5 text-destructive" />
            </div>
            <p className="text-sm font-medium mb-1">Something went wrong</p>
            <p className="text-xs text-muted-foreground mb-4">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => {
                if (activeGroup?.id) {
                  startTransition(async () => {
                    await fetchDashboardData(activeGroup.id);
                  });
                }
              }}
            >
              Try Again
            </Button>
          </motion.div>
        ) : dashboardData ? (
          <motion.div
            key={activeGroup?.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <SummaryBalanceCard
              totalBalance={
                dashboardData.balance.youAreOwed - dashboardData.balance.youOwe
              }
              youOwe={dashboardData.balance.youOwe}
              youAreOwed={dashboardData.balance.youAreOwed}
            />
            <QuickActions
              activeGroupId={activeGroup?.id!}
              onInvite={() => setInviteModalOpen(true)}
            />
            <ActivityFeed activities={dashboardData.activities} />
          </motion.div>
        ) : (
          <DashboardShimmer key="loading" />
        )}
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
          groupName={activeGroup?.name ?? ""}
          inviteCode={activeGroup?.inviteCode ?? ""}
        />
      )}
    </motion.div>
  );
}
