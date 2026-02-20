"use client";

import { motion } from "framer-motion";
import { ActivityItem, type ActivityItemProps } from "./activity-item";
import { Separator } from "@/ui/base/separator";

interface ActivityData extends ActivityItemProps {
  id: string;
}

interface ActivityFeedProps {
  activities: ActivityData[];
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
        <button className="text-sm text-primary font-medium hover:underline">
          See all
        </button>
      </div>

      <div className="rounded-2xl bg-card border border-border/50 px-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.28 + index * 0.06 }}
          >
            <ActivityItem {...activity} />
            {index < activities.length - 1 && <Separator />}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
