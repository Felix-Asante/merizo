type cacheTags = "users" | "organizations" | "activities";

export function getGlobalTag(tag: cacheTags) {
  return `global:${tag}`;
}

export function getUserTag(userId: string) {
  return `users:${userId}`;
}

export function getUserOrganizationsTag(userId: string) {
  return `users:${userId}:organizations`;
}

export function getOrganizationActivitiesTag(organizationId: string) {
  return `organizations:${organizationId}:activities`;
}
