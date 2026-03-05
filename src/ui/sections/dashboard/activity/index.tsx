"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import { motion } from "framer-motion";
import { AlertCircleIcon } from "lucide-react";
import { Skeleton } from "@/ui/base/skeleton";
import { Button } from "@/ui/base/button";
import { ActivityNavbar } from "./activity-navbar";
import { ActivityFilters } from "./activity-filters";
import { ActivityList } from "./activity-list";
import {
  getActivityPageData,
  type ActivityPageData,
} from "@/services/activity/activity-actions";
import type { ActivityItem } from "@/types/expenses";

interface ActivityPageProps {
  groupId: string;
  initialData: ActivityPageData;
}

export function ActivityPage({ groupId, initialData }: ActivityPageProps) {
  const [isPending, startTransition] = useTransition();

  const [activities, setActivities] = useState<ActivityItem[]>(
    initialData.activities,
  );
  const [total, setTotal] = useState(initialData.total);
  const [page, setPage] = useState(initialData.page);
  const [pageSize] = useState(initialData.pageSize);
  const [error, setError] = useState<string | null>(null);

  const [memberId, setMemberId] = useState<string | undefined>();
  const [periodId, setPeriodId] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchActivities = useCallback(
    (overrides: { page?: number } = {}) => {
      startTransition(async () => {
        setError(null);
        const result = await getActivityPageData(groupId, {
          memberId,
          periodId,
          search: debouncedSearch || undefined,
          page: overrides.page ?? 1,
        });

        if (result.error || !result.data) {
          setError(result.error ?? "Failed to load activities");
        } else {
          setActivities(result.data.activities);
          setTotal(result.data.total);
          setPage(result.data.page);
        }
      });
    },
    [groupId, memberId, periodId, debouncedSearch],
  );

  useEffect(() => {
    fetchActivities({ page: 1 });
  }, [memberId, periodId, debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    fetchActivities({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="max-w-3xl mx-auto space-y-5"
    >
      <ActivityNavbar />

      <ActivityFilters
        members={initialData.members}
        periods={initialData.periods}
        selectedMemberId={memberId}
        selectedPeriodId={periodId}
        search={search}
        onMemberChange={setMemberId}
        onPeriodChange={setPeriodId}
        onSearchChange={setSearch}
      />

      {error ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
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
            onClick={() => fetchActivities()}
          >
            Try Again
          </Button>
        </motion.div>
      ) : isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-[320px] rounded-2xl" />
        </div>
      ) : (
        <ActivityList
          activities={activities}
          total={total}
          page={page}
          pageSize={pageSize}
          isLoading={isPending}
          onPageChange={handlePageChange}
        />
      )}
    </motion.div>
  );
}
