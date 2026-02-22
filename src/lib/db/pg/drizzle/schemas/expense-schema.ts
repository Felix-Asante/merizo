import {
  pgTable,
  text,
  numeric,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { group, member } from "./group-schema";
import { relations, Relations } from "drizzle-orm";

const monthlyPeriodStatus = pgEnum("monthly_period_status", [
  "open",
  "finalized",
]);

const splitType = pgEnum("split_type", ["percentage", "equal", "custom"]);

export const expense = pgTable("expense", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  note: text("note"),
  organizationId: text("organization_id")
    .notNull()
    .references(() => group.id, { onDelete: "cascade" }),
  paidByUserId: text("paid_by_user_id")
    .notNull()
    .references(() => member.id, { onDelete: "cascade" }),
  amount: numeric("amount").notNull(),
  splitType: splitType("split_type").default("equal").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expenseDate: timestamp("expense_date").notNull(),
  periodId: text("period_id")
    .notNull()
    .references(() => monthlyPeriods.id, { onDelete: "cascade" }),
});

export const expenseSplit = pgTable("expense_split", {
  id: text("id").primaryKey(),
  expenseId: text("expense_id")
    .notNull()
    .references(() => expense.id, { onDelete: "cascade" }),
  memberId: text("member_id")
    .notNull()
    .references(() => member.id, { onDelete: "cascade" }),
  amount: numeric("amount").notNull(),
  percentage: numeric("percentage"),
});

export const monthlyPeriods = pgTable("monthly_periods", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => group.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  status: monthlyPeriodStatus("status").default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  finalizedAt: timestamp("finalized_at"),
  finalizedByUserId: text("finalized_by_user_id").references(() => member.id, {
    onDelete: "cascade",
  }),
});

export const settlements = pgTable("settlements", {
  id: text("id").primaryKey(),
  periodId: text("period_id")
    .notNull()
    .references(() => monthlyPeriods.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settlementItems = pgTable("settlement_items", {
  id: text("id").primaryKey(),
  settlementId: text("settlement_id")
    .notNull()
    .references(() => settlements.id, { onDelete: "cascade" }),
  fromMemberId: text("from_member_id")
    .notNull()
    .references(() => member.id, { onDelete: "cascade" }),
  toMemberId: text("to_member_id")
    .notNull()
    .references(() => member.id, { onDelete: "cascade" }),
  amount: numeric("amount").notNull(),
});

// Relations

export const expenseRelations = relations(expense, ({ one, many }) => ({
  organization: one(group, {
    fields: [expense.organizationId],
    references: [group.id],
  }),
  paidByUser: one(member, {
    fields: [expense.paidByUserId],
    references: [member.id],
  }),
  period: one(monthlyPeriods, {
    fields: [expense.periodId],
    references: [monthlyPeriods.id],
  }),
  splits: many(expenseSplit),
}));

export const expenseSplitRelations = relations(expenseSplit, ({ one }) => ({
  expense: one(expense, {
    fields: [expenseSplit.expenseId],
    references: [expense.id],
  }),
  member: one(member, {
    fields: [expenseSplit.memberId],
    references: [member.id],
  }),
}));

export const monthlyPeriodRelations = relations(
  monthlyPeriods,
  ({ one, many }) => ({
    organization: one(group, {
      fields: [monthlyPeriods.organizationId],
      references: [group.id],
    }),
    expenses: many(expense),
    settlements: many(settlements),
  }),
);

export const settlementRelations = relations(settlements, ({ one, many }) => ({
  period: one(monthlyPeriods, {
    fields: [settlements.periodId],
    references: [monthlyPeriods.id],
  }),
  items: many(settlementItems),
}));

export const settlementItemRelations = relations(
  settlementItems,
  ({ one }) => ({
    settlement: one(settlements, {
      fields: [settlementItems.settlementId],
      references: [settlements.id],
    }),
    fromMember: one(member, {
      fields: [settlementItems.fromMemberId],
      references: [member.id],
    }),
    toMember: one(member, {
      fields: [settlementItems.toMemberId],
      references: [member.id],
    }),
  }),
);
