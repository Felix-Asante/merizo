import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  index,
  type PgColumn,
  type PgTableWithColumns,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { relations } from "drizzle-orm";
import {
  expense,
  monthlyPeriods,
  settlementItems,
  settlements,
} from "./expense-schema";

export const group = pgTable(
  "organization",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    createdAt: timestamp("created_at").notNull(),
    metadata: text("metadata"),
    inviteCode: text("invite_code").notNull().unique(),
    currency: text("currency").notNull(),
    type: text("type"),
  },
  (table) => [uniqueIndex("organization_slug_uidx").on(table.slug)],
);

export const member = pgTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId),
  ],
);

export const invitation = pgTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("invitation_organizationId_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
  ],
);

export const organizationRelations = relations(group, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
  expenses: many(expense),
  monthlyPeriods: many(monthlyPeriods),
}));

export const memberRelations = relations(member, ({ one, many }) => ({
  organization: one(group, {
    fields: [member.organizationId],
    references: [group.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
  expenses: many(expense),
  settlements: many(settlements),
  settlementItems: many(settlementItems),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(group, {
    fields: [invitation.organizationId],
    references: [group.id],
  }),
  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));
