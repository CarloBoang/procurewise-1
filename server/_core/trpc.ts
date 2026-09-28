import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { TrpcContext } from "./context";

function formatZodIssue(issue: any): string {
  const path = issue.path ?? [];
  if (path[0] === "items" && typeof path[1] === "number") {
    const itemNum = path[1] + 1;
    const field = path[2];
    if (field === "unit") return `Item #${itemNum}: Unit of measurement is required (e.g. pc, box, set, unit, lot).`;
    if (field === "description") return `Item #${itemNum}: Description is required (at least 2 characters).`;
    if (field === "quantity") return `Item #${itemNum}: Quantity must be greater than 0.`;
    if (field === "estimatedUnitCost") return `Item #${itemNum}: Estimated unit cost must be greater than ₱0.00.`;
    return `Item #${itemNum}${field ? ` (${field})` : ""}: ${issue.message}`;
  }

  if (issue.message && !issue.message.startsWith("Too small") && !issue.message.startsWith("Expected") && !issue.message.startsWith("Invalid")) {
    return issue.message;
  }

  const fieldLabel = path.length ? path.join(".") : "Field";
  return `${fieldLabel}: ${issue.message}`;
}

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    let message = shape.message;
    if (error.cause instanceof ZodError) {
      const firstIssue = error.cause.issues[0];
      if (firstIssue) {
        message = formatZodIssue(firstIssue);
      }
    }
    return {
      ...shape,
      message,
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
