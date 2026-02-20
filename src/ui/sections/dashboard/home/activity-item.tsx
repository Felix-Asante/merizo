import { cn } from "@/ui/utils";
import { UserAvatar } from "@/ui/shared/avatar";

export interface ActivityItemProps {
  name: string;
  description: string;
  amount: number;
  date: string;
  status: "settled" | "pending";
  isCurrentUser?: boolean;
}

export function ActivityItem({
  name,
  description,
  amount,
  date,
  status,
  isCurrentUser,
}: ActivityItemProps) {
  return (
    <div className="flex items-center gap-3 py-3">
      <UserAvatar name={name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {isCurrentUser ? "You" : name}{" "}
          <span className="text-muted-foreground font-normal">paid for</span>{" "}
          {description}
        </p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <div className="text-right shrink-0">
        <p
          className={cn(
            "text-sm font-semibold",
            status === "settled"
              ? "text-muted-foreground line-through"
              : amount >= 0
                ? "text-emerald-400"
                : "text-red-400",
          )}
        >
          {amount >= 0 ? "+" : "-"}${Math.abs(amount).toFixed(2)}
        </p>
        <span
          className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
            status === "settled"
              ? "bg-muted text-muted-foreground"
              : "bg-amber-500/10 text-amber-400",
          )}
        >
          {status === "settled" ? "Settled" : "Pending"}
        </span>
      </div>
    </div>
  );
}
