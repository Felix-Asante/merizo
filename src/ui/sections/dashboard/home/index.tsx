"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SummaryBalanceCard } from "./summary-balance-card";
import { QuickActions } from "./quick-actions";
import { ActivityFeed } from "./activity-feed";
import { GroupSwitcher } from "./group-switcher";
import { NoGroupView } from "./no-group-view";
import { JoinGroupModal } from "./join-group-modal";
import { DashboardShimmer } from "./dashboard-shimmer";
import { DUMMY_GROUPS, DUMMY_GROUP_DATA, type Group } from "./dummy-data";

export function DashboardHome() {
  const [groups, setGroups] = useState<Group[]>(DUMMY_GROUPS);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(
    DUMMY_GROUPS[0]?.id ?? null,
  );
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleGroupChange = useCallback(
    (groupId: string) => {
      if (groupId === activeGroupId) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveGroupId(groupId);
        setIsTransitioning(false);
      }, 250);
    },
    [activeGroupId],
  );

  const handleJoinGroup = useCallback(async (code: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (code === "invalid") throw new Error("Invalid code");

    const newGroup: Group = {
      id: String(Date.now()),
      name: `Joined Group (${code})`,
      membersCount: 3,
      balance: 0,
    };
    setGroups((prev) => [...prev, newGroup]);
    setActiveGroupId(newGroup.id);
  }, []);

  if (groups.length === 0) {
    return (
      <>
        <NoGroupView
          onCreateGroup={() => {}}
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

  const groupData = activeGroupId ? DUMMY_GROUP_DATA[activeGroupId] : null;

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
          groups={groups}
          activeGroupId={activeGroupId!}
          onGroupChange={handleGroupChange}
          onCreateGroup={() => {}}
          onJoinGroup={() => setJoinModalOpen(true)}
        />
      </div>

      <AnimatePresence mode="wait">
        {isTransitioning ? (
          <DashboardShimmer key="shimmer" />
        ) : groupData ? (
          <motion.div
            key={activeGroupId}
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
            <QuickActions />
            <ActivityFeed activities={groupData.activities} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <JoinGroupModal
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onJoin={handleJoinGroup}
      />
    </motion.div>
  );
}
