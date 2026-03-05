"use client";

import { createAuthClient } from "better-auth/react";
import {
  inferOrgAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    `https://${process.env.VERCEL_URL}`,
  plugins: [
    organizationClient({
      schema: inferOrgAdditionalFields<typeof auth>(),
    }),
  ],
});
