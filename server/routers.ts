import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
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

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
