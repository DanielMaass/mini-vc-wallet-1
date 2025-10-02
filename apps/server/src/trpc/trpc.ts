import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { TasksService } from '../tasks/tasks.service';

// Context factory (extend later with auth, db, etc.)
export interface TrpcContext {
  tasksService: TasksService;
}

const t = initTRPC.context<TrpcContext>().create();

const createTaskInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime(),
});

export const appRouter = t.router({
  createTask: t.procedure
    .input(createTaskInput)
    .mutation(
      async ({ input, ctx }: { input: z.infer<typeof createTaskInput>; ctx: TrpcContext }) => {
        return ctx.tasksService.create({
          title: input.title,
          description: input.description,
          dueDate: input.dueDate,
        });
      },
    ),
  listTasks: t.procedure.query(async ({ ctx }: { ctx: TrpcContext }) => ctx.tasksService.findAll()),
});

export type AppRouter = typeof appRouter;
