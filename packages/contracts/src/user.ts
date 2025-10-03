import { z } from 'zod';

export const UserId = z.string().uuid();
export type UserId = z.infer<typeof UserId>;

export const User = z.object({
  id: UserId,
  email: z.string().email(),
  name: z.string().min(1),
});
export type User = z.infer<typeof User>;

export const CreateUserInput = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});
export type CreateUserInput = z.infer<typeof CreateUserInput>;
