import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, type User, financeWorkspaces, financeTransactions, financeBudgets, financeBills } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Database is not available");
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function insertEmailUser(input: { email: string; name: string; passwordHash: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const openId = `em_${Buffer.from(input.email).toString("base64url").slice(0, 40)}_${Date.now().toString(36)}`.slice(0, 64);
  await db.insert(users).values({ openId, email: input.email, name: input.name, passwordHash: input.passwordHash, authProvider: "email", loginMethod: "email", lastSignedIn: new Date() });
  const created = await getUserByOpenId(openId);
  if (!created) throw new Error("User gagal dibuat");
  return created;
}

export async function touchUser(openId: string) {
  const db = await getDb();
  if (db) await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.openId, openId));
}

export function createGuestUser(): User {
  const now = new Date();
  return { id: -1, openId: "guest", name: "Tamu", email: null, passwordHash: null, authProvider: "guest", loginMethod: "guest", role: "user", createdAt: now, updatedAt: now, lastSignedIn: now };
}

export async function getOrCreateFinanceWorkspaces(ownerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  let rows = await db.select().from(financeWorkspaces).where(eq(financeWorkspaces.ownerId, ownerId));
  if (rows.length === 0) {
    await db.insert(financeWorkspaces).values([
      { ownerId, kind: "personal", name: "Personal", currency: "IDR" },
      { ownerId, kind: "business", name: "Business", currency: "IDR" },
    ]);
    rows = await db.select().from(financeWorkspaces).where(eq(financeWorkspaces.ownerId, ownerId));
  }
  return rows;
}

export async function getFinanceWorkspace(ownerId: number, kind: "personal" | "business") {
  const rows = await getOrCreateFinanceWorkspaces(ownerId);
  return rows.find(row => row.kind === kind) ?? rows[0];
}

export async function listFinanceTransactions(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(financeTransactions).where(eq(financeTransactions.workspaceId, workspaceId));
}

export async function createFinanceTransaction(input: typeof financeTransactions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(financeTransactions).values(input);
  const rows = await db.select().from(financeTransactions).where(eq(financeTransactions.id, result[0].insertId));
  return rows[0];
}

export async function deleteFinanceTransaction(workspaceId: number, id: number) {
  const db = await getDb();
  if (db) await db.delete(financeTransactions).where(and(eq(financeTransactions.workspaceId, workspaceId), eq(financeTransactions.id, id)));
}

export async function listFinanceBudgets(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(financeBudgets).where(eq(financeBudgets.workspaceId, workspaceId));
}

export async function listFinanceBills(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(financeBills).where(eq(financeBills.workspaceId, workspaceId));
}

// TODO: add feature queries here as your schema grows.
