import AuthWrapper from "../components/AuthWrapper";

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
