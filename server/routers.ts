import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { clearAppSession, authenticateEmail, createEmailUser, setAppSession } from "./_core/appAuth";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const publicUser = (user: NonNullable<import("../drizzle/schema").User>) => {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
};

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user ? publicUser(opts.ctx.user) : null),
    session: publicProcedure.query(opts => opts.ctx.user ? { user: publicUser(opts.ctx.user), isGuest: opts.ctx.isGuest } : null),
    signupEmail: publicProcedure.input(z.object({ email: z.string(), name: z.string().max(80), password: z.string().min(8) })).mutation(async ({ ctx, input }) => {
      try {
        const user = await createEmailUser(input.email, input.name, input.password);
        await setAppSession(ctx.res, user);
        return { user: publicUser(user), isGuest: false };
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Pendaftaran gagal." });
      }
    }),
    loginEmail: publicProcedure.input(z.object({ email: z.string(), password: z.string() })).mutation(async ({ ctx, input }) => {
      try {
        const user = await authenticateEmail(input.email, input.password);
        await setAppSession(ctx.res, user);
        return { user: publicUser(user), isGuest: false };
      } catch (error) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: error instanceof Error ? error.message : "Login gagal." });
      }
    }),
    guest: publicProcedure.mutation(async ({ ctx }) => {
      const user = db.createGuestUser();
      await setAppSession(ctx.res, user, true);
      return { user: publicUser(user), isGuest: true };
    }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      await clearAppSession(ctx.req, ctx.res);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  finance: router({
    dashboard: protectedProcedure.input(z.object({ kind: z.enum(["personal", "business"]) })).query(async ({ ctx, input }) => {
      const workspace = await db.getFinanceWorkspace(ctx.user.id, input.kind);
      if (!workspace) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Workspace gagal dibuat." });
      const [transactions, budgets, bills] = await Promise.all([
        db.listFinanceTransactions(workspace.id),
        db.listFinanceBudgets(workspace.id),
        db.listFinanceBills(workspace.id),
      ]);
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthTransactions = transactions.filter(item => item.occurredAt >= monthStart);
      const income = monthTransactions.filter(item => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
      const expenses = monthTransactions.filter(item => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
      const categoryTotals = new Map<string, number>();
      monthTransactions.filter(item => item.type === "expense").forEach(item => categoryTotals.set(item.category, (categoryTotals.get(item.category) ?? 0) + item.amount));
      return { workspace, transactions, budgets, bills, summary: { income, expenses, cashflow: income - expenses, balance: transactions.reduce((sum, item) => sum + (item.type === "income" ? item.amount : -item.amount), 0), categories: Array.from(categoryTotals, ([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total) } };
    }),
    createTransaction: protectedProcedure.input(z.object({ kind: z.enum(["personal", "business"]), type: z.enum(["income", "expense"]), merchant: z.string().min(1).max(160), category: z.string().min(1).max(80), amount: z.number().int().positive(), occurredAt: z.string(), note: z.string().max(500).optional() })).mutation(async ({ ctx, input }) => {
      const workspace = await db.getFinanceWorkspace(ctx.user.id, input.kind);
      if (!workspace) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Workspace gagal dibuat." });
      return db.createFinanceTransaction({ workspaceId: workspace.id, type: input.type, merchant: input.merchant, category: input.category, amount: input.amount, occurredAt: new Date(input.occurredAt), note: input.note });
    }),
    deleteTransaction: protectedProcedure.input(z.object({ kind: z.enum(["personal", "business"]), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const workspace = await db.getFinanceWorkspace(ctx.user.id, input.kind);
      if (workspace) await db.deleteFinanceTransaction(workspace.id, input.id);
      return { success: true } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
