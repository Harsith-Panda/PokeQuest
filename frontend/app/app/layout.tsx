import ProtectedRoutes from "../components/ProtectedRoutes";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // HttpOnly JWT cookie
  return <ProtectedRoutes>{children}</ProtectedRoutes>;
}
