type cacheTags = "users" | "groups" | "activities" | "session";

export function getGlobalTag(tag: cacheTags) {
  return `global:${tag}`;
}

export function getUserTag(userId: string) {
  return `users:${userId}`;
}

export function getUserGroupsTag(userId: string) {
  return `users:${userId}:groups`;
}

export function getGroupActivitiesTag(groupId: string) {
  return `groups:${groupId}:activities`;
}

export function getSessionTag() {
  return `session`;
}

export function getGroupMembersTag(groupId: string) {
  return `groups:${groupId}:members`;
}
