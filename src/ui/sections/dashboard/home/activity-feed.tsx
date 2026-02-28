"use client";

import { motion } from "framer-motion";
import { InboxIcon } from "lucide-react";
import Link from "next/link";
import { ActivityItem, type ActivityItemProps } from "./activity-item";
import { Separator } from "@/ui/base/separator";

interface ActivityFeedProps {
  activities: ActivityItemProps[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.24 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        {activities.length > 0 && (
          <Link
            href="/activity"
            className="text-sm text-primary font-medium hover:underline"
          >
            See all
          </Link>
        )}
      </div>

      <div className="rounded-2xl bg-card border border-border/50 px-4">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex items-center justify-center size-12 rounded-full bg-muted/50 mb-3">
              <InboxIcon className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No activity yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Expenses and settlements will appear here
            </p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.28 + index * 0.06 }}
            >
              <ActivityItem {...activity} />
              {index < activities.length - 1 && <Separator />}
            </motion.div>
          ))
        )}
      </div>
    </motion.section>
  );
}
