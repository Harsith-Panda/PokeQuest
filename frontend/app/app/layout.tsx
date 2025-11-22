import { api } from "../utils/api/api";
import { redirect } from "next/navigation";
import ZustandUser from "../components/ZustandUser";
import AuthWrapper from "../components/AuthWrapper";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const response = await api.get("/api/auth/me");

  // if (response.status !== 200) {
  //   redirect("/login");
  // }

  // const user = response.data.data;

  return (
    <>
      {/*<ZustandUser user={user} />*/}
      <AuthWrapper>{children}</AuthWrapper>
    </>
  );
}
