import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "./admin-shell";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session || session.role !== "admin") {
    redirect("/login?role=admin&next=/admin");
  }
  return <AdminShell>{children}</AdminShell>;
}
