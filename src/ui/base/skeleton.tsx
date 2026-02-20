import { cn } from "@/ui/utils/index";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-card animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
