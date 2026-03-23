"use client";

import { motion } from "framer-motion";
import { InboxIcon } from "lucide-react";
import { ActivityItem } from "@/ui/sections/dashboard/home/activity-item";
import { Separator } from "@/ui/base/separator";
import { Button } from "@/ui/base/button";
import type { ActivityItem as ActivityItemType } from "@/types/expenses";

interface ActivityListProps {
  activities: ActivityItemType[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onItemClick?: (id: string) => void;
}

export function ActivityList({
  activities,
  total,
  page,
  pageSize,
  isLoading,
  onPageChange,
  onItemClick,
}: ActivityListProps) {
  const totalPages = Math.ceil(total / pageSize);
  const hasMore = page < totalPages;

  if (activities.length === 0 && !isLoading) {
    return (
      <div className="rounded-2xl bg-card border border-border/50 px-4">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex items-center justify-center size-12 rounded-full bg-muted/50 mb-3">
            <InboxIcon className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            No activities found
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {total} {total === 1 ? "expense" : "expenses"}
        </p>
        {totalPages > 1 && (
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
        )}
      </div>

      <div className="rounded-2xl bg-card border border-border/50 px-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
          >
            <ActivityItem {...activity} onClick={onItemClick} />
            {index < activities.length - 1 && <Separator />}
          </motion.div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={!hasMore || isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
