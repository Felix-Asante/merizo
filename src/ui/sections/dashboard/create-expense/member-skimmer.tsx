import { Skeleton } from "@/ui/base/skeleton";

export function MemberSkimmer() {
  return (
    <div className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left">
      <Skeleton className="h-8 w-8 rounded-full bg-accent/50" />
      <Skeleton className="h-8 w-full bg-accent/50" />
    </div>
  );
}
