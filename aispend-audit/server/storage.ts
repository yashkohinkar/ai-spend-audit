import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { audits, leads } from "@shared/schema";

/**
 * Storage layer — picks Supabase when env vars are present (production), else
 * falls back to a local SQLite file (dev/demo). Both implement IStorage so the
 * rest of the app is backend-agnostic.
 *
 * Graceful degradation is the whole point: the app must demo even when no
 * backend is configured, so a no-op InMemoryStorage is used as a last resort.
 */

export interface StoredAudit {
  shareId: string;
  payload: string; // JSON
  createdAt: number;
}

export interface StoredLead {
  id?: number;
  email: string;
  company?: string | null;
  role?: string | null;
  teamSize?: number | null;
  shareId?: string | null;
  auditSnapshot?: string | null;
  createdAt?: number;
}

export interface IStorage {
  saveAudit(shareId: string, payload: string): Promise<void>;
  getAudit(shareId: string): Promise<StoredAudit | null>;
  saveLead(lead: StoredLead): Promise<void>;
}

// ---- Supabase backend -----------------------------------------------------
class SupabaseStorage implements IStorage {
  private client: SupabaseClient;
  constructor(url: string, key: string) {
    this.client = createClient(url, key);
  }
  async saveAudit(shareId: string, payload: string): Promise<void> {
    const { error } = await this.client.from("audits").insert({
      share_id: shareId,
      payload,
    });
    if (error) throw error;
  }
  async getAudit(shareId: string): Promise<StoredAudit | null> {
    const { data, error } = await this.client
      .from("audits")
      .select("share_id,payload,created_at")
      .eq("share_id", shareId)
      .maybeSingle();
    if (error || !data) return null;
    return {
      shareId: data.share_id,
      payload: data.payload,
      createdAt: data.created_at,
    };
  }
  async saveLead(lead: StoredLead): Promise<void> {
    const { error } = await this.client.from("leads").insert({
      email: lead.email,
      company: lead.company ?? null,
      role: lead.role ?? null,
      team_size: lead.teamSize ?? null,
      share_id: lead.shareId ?? null,
      audit_snapshot: lead.auditSnapshot ?? null,
    });
    if (error) throw error;
  }
}

// ---- SQLite backend (local dev fallback) ---------------------------------
class SqliteStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  constructor() {
    const sqlite = new Database("data.db");
    sqlite.pragma("journal_mode = WAL");
    // Auto-create tables for dev convenience.
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS audits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        share_id TEXT NOT NULL UNIQUE,
        payload TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        company TEXT,
        role TEXT,
        team_size INTEGER,
        share_id TEXT,
        audit_snapshot TEXT,
        created_at INTEGER NOT NULL
      );
    `);
    this.db = drizzle(sqlite);
  }
  async saveAudit(shareId: string, payload: string): Promise<void> {
    this.db
      .insert(audits)
      .values({ shareId, payload, createdAt: Date.now() })
      .onConflictDoNothing()
      .run();
  }
  async getAudit(shareId: string): Promise<StoredAudit | null> {
    const row = this.db
      .select()
      .from(audits)
      .where(eq(audits.shareId, shareId))
      .get();
    return row ?? null;
  }
  async saveLead(lead: StoredLead): Promise<void> {
    this.db
      .insert(leads)
      .values({
        email: lead.email,
        company: lead.company ?? null,
        role: lead.role ?? null,
        teamSize: lead.teamSize ?? null,
        shareId: lead.shareId ?? null,
        auditSnapshot: lead.auditSnapshot ?? null,
        createdAt: Date.now(),
      })
      .run();
  }
}

// ---- In-memory fallback (no backend configured) --------------------------
class InMemoryStorage implements IStorage {
  private auditMap = new Map<string, StoredAudit>();
  private leads: StoredLead[] = [];
  async saveAudit(shareId: string, payload: string): Promise<void> {
    this.auditMap.set(shareId, { shareId, payload, createdAt: Date.now() });
  }
  async getAudit(shareId: string): Promise<StoredAudit | null> {
    return this.auditMap.get(shareId) ?? null;
  }
  async saveLead(lead: StoredLead): Promise<void> {
    this.leads.push(lead);
  }
}

function createStorage(): IStorage {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      return new SupabaseStorage(url, key);
    } catch (e) {
      console.warn("[storage] Supabase init failed, falling back:", e);
    }
  }
  // In the read-only deploy preview sandbox SQLite write may fail; guard it.
  try {
    return new SqliteStorage();
  } catch (e) {
    console.warn("[storage] SQLite init failed, using in-memory:", e);
    return new InMemoryStorage();
  }
}

export const storage = createStorage();
