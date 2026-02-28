import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AppClient from "../app-client";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session) redirect("/login?next=/dashboard");
  return <AppClient session={session} />;
}
