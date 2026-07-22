import type { Express } from "express";
import type { Server } from "node:http";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import { audit } from "@shared/audit";
import { leadSchema } from "@shared/schema";
import type { AuditInput } from "@shared/audit";
import { generateSummary } from "./llm";
import { buildShareHtml } from "./og";

// ---- In-memory rate limiter (per-IP, lead endpoint) ----------------------
// Simple sliding-window limiter. Sufficient for abuse protection on a free
// lead-capture form; documented choice in README (no external deps, no state).
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

export async function registerRoutes(
  _httpServer: Server,
  app: Express
): Promise<Server> {
  // ---- Compute audit + create shareable record (PII stripped) -----------
  app.post("/api/audit", async (req, res) => {
    const input = req.body as AuditInput;
    if (!input || !Array.isArray(input.tools) || input.tools.length === 0) {
      return res.status(400).json({ message: "Invalid audit input" });
    }
    const result = audit(input);
    const shareId = nanoid(10);

    // Public payload: only tool names, plan names, spend, savings — no email/company.
    const publicPayload = {
      shareId,
      result,
      useCase: input.useCase,
      teamSize: input.teamSize,
      createdAt: Date.now(),
    };

    try {
      await storage.saveAudit(shareId, JSON.stringify(publicPayload));
    } catch (e) {
      console.error("[audit] persist failed (continuing without share):", e);
    }

    return res.json({ result, shareId });
  });

  // ---- Fetch a stored public audit for the share page -------------------
  app.get("/api/audits/:shareId", async (req, res) => {
    const row = await storage.getAudit(req.params.shareId);
    if (!row) return res.status(404).json({ message: "Audit not found" });
    return res.json(JSON.parse(row.payload));
  });

  // ---- AI-generated personalized summary (Anthropic w/ fallback) -------
  app.post("/api/summary", async (req, res) => {
    const { result, useCase, teamSize } = req.body ?? {};
    if (!result) return res.status(400).json({ message: "Missing audit result" });
    const summary = await generateSummary(result, useCase, teamSize);
    return res.json({ summary, fallback: !process.env.ANTHROPIC_API_KEY });
  });

  // ---- Lead capture: store + transactional email + abuse protection -----
  app.post("/api/lead", async (req, res) => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";

    // Honeypot: a hidden "website" field that real users never fill.
    const parsed = leadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }
    if (parsed.data.website) {
      // Bot filled the honeypot — pretend success, drop silently.
      return res.json({ ok: true });
    }
    if (rateLimited(ip)) {
      return res.status(429).json({ message: "Too many submissions. Please try again later." });
    }

    const { email, company, role, teamSize, shareId, auditSnapshot } = parsed.data;
    try {
      await storage.saveLead({
        email,
        company,
        role,
        teamSize,
        shareId,
        auditSnapshot,
      });
    } catch (e) {
      console.error("[lead] storage failed:", e);
    }

    // Transactional confirmation email (graceful skip if Resend not configured).
    let totalMonthlySavings = 0;
    try {
      const parsedSnapshot = auditSnapshot ? JSON.parse(auditSnapshot) : null;
      totalMonthlySavings = parsedSnapshot?.totalMonthlySavings ?? 0;
    } catch {
      /* ignore malformed snapshot */
    }
    try {
      const { sendConfirmationEmail } = await import("./email");
      await sendConfirmationEmail(email, shareId, totalMonthlySavings);
    } catch (e) {
      console.warn("[lead] email send skipped:", e);
    }

    return res.json({ ok: true });
  });

  // ---- Shareable public URL with Open Graph + Twitter card tags --------
  // Served as real HTML (not the SPA) so link-preview crawlers see the meta tags.
  app.get("/s/:shareId", async (req, res) => {
    const row = await storage.getAudit(req.params.shareId);
    if (!row) {
      return res.status(404).send(buildShareHtml({ found: false, shareId: req.params.shareId }));
    }
    const payload = JSON.parse(row.payload);
    res.send(buildShareHtml({ found: true, shareId: req.params.shareId, payload }));
  });

  return _httpServer;
}
