import AuthWrapper from "../components/AuthWrapper";
import "leaflet/dist/leaflet.css";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthWrapper>{children}</AuthWrapper>
    </>
  );
}
