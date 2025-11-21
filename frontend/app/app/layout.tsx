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
  let user = undefined;

  try {
    const response = await api.get("/api/auth/me", {
      headers: {
        Cookie: `accessToken=${token}`, // ⬅⬅⬅ ABSOLUTELY REQUIRED
      },
      validateStatus: () => true, // ⬅ stops axios from throwing
    });

    // if (response.status !== 200) {
    //   redirect("/login");
    // }

    user = response.data.data;
  } catch (e) {
    redirect("/login");
  }

  return (
    <>
      <ZustandUser user={user} />
      {children}
    </>
  );
}
