import { auth } from "./auth";

export interface AdminSession {
  userId: number;
  email: string;
  name: string;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.tier !== "ADMIN") return null;
  return {
    userId: parseInt(user.id),
    email: user.email,
    name: user.name,
  };
}
