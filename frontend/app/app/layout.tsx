import { api } from "../utils/api/api";
import { redirect } from "next/navigation";
import ZustandUser from "../components/ZustandUser";
import { cookies } from "next/headers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const response = await api.get("/api/auth/me", {
    withCredentials: true,
  });

  if (response.status !== 200) {
    redirect("/login");
  }

  const user = response.data.data;

  return (
    <>
      <ZustandUser user={user} />
      {children}
    </>
  );
}
