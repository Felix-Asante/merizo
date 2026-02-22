"use server";

import type { User } from "@/types/users";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../index";

export async function isAuthenticated() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session !== null;
}

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user;
}

export async function withAuthenticatedUser<T>(
  callback: (user: User) => T | Promise<T>,
): Promise<T> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return callback(session.user);
}
