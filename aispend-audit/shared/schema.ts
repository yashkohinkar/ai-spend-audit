import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Local-dev persistence (SQLite via Drizzle). Production uses Supabase (see
 * server/storage.ts + the Supabase migration in README). Both backends store the
 * same shapes so the audit/share/lead logic is backend-agnostic.
 *
 * NOTE: the public shareable audit is stored WITHOUT email/company (see
 * server/routes.ts → /api/audits), so a leaked share URL leaks no PII.
 */

export const audits = sqliteTable("audits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  shareId: text("share_id").notNull().unique(),
  // Sanitized, PII-stripped payload shown on the public share page.
  payload: text("payload").notNull(), // JSON string
  createdAt: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  company: text("company"),
  role: text("role"),
  teamSize: integer("team_size"),
  shareId: text("share_id"),
  auditSnapshot: text("audit_snapshot"), // JSON of the full audit at capture time
  createdAt: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});

export const insertLeadSchema = createInsertSchema(leads).pick({
  email: true,
  company: true,
  role: true,
  teamSize: true,
  shareId: true,
  auditSnapshot: true,
});

export const leadSchema = insertLeadSchema.extend({
  email: z.string().email().max(254),
  company: z.string().max(120).optional(),
  role: z.string().max(120).optional(),
  teamSize: z.number().int().min(1).max(100000).optional(),
  shareId: z.string().max(64).optional(),
  auditSnapshot: z.string().max(200000).optional(),
  // honeypot — must be empty; validated in route
  website: z.string().max(0).optional(),
});

export type InsertLead = z.infer<typeof leadSchema>;
export type Lead = typeof leads.$inferSelect;
export type Audit = typeof audits.$inferSelect;
