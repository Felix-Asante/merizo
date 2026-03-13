import { cn } from "@/ui/utils";
import { UserAvatar } from "@/ui/shared/avatar";
import { useActiveCurrency } from "@/hooks/use-active-currency";

export interface ActivityItemProps {
  id: string;
  title: string;
  amount: number;
  paidByName: string;
  isCurrentUser: boolean;
  userSplitAmount: number;
  createdAt: Date;
  periodStatus: string;
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function ActivityItem({
  title,
  amount,
  paidByName,
  isCurrentUser,
  userSplitAmount,
  createdAt,
  periodStatus,
}: ActivityItemProps) {
  const isSettled = periodStatus === "finalized";
  const displayAmount = isCurrentUser
    ? amount - userSplitAmount
    : -userSplitAmount;
  const { symbol } = useActiveCurrency();

  return (
    <div className="flex items-center gap-3 py-3">
      <UserAvatar name={paidByName} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {isCurrentUser ? "You" : paidByName}{" "}
          <span className="text-muted-foreground font-normal">paid for</span>{" "}
          {title}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatRelativeDate(createdAt)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p
          className={cn(
            "text-sm font-semibold",
            isSettled
              ? "text-muted-foreground line-through"
              : displayAmount >= 0
                ? "text-emerald-400"
                : "text-red-400",
          )}
        >
          {displayAmount >= 0 ? "+" : "-"}
          {symbol}
          {Math.abs(displayAmount).toFixed(2)}
        </p>
        <span
          className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
            isSettled
              ? "bg-muted text-muted-foreground"
              : "bg-amber-500/10 text-amber-400",
          )}
        >
          {isSettled ? "Settled" : "Pending"}
        </span>
      </div>
    </div>
  );
}
