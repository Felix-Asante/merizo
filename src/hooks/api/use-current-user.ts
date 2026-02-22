import { authClient } from "@/lib/auth/client";

export function useCurrentUser() {
  const { data, isPending, error } = authClient.useSession();

  return { currentUser: data?.user, isPending, error };
}
