import { useLocation } from "react-router-dom";
import NavBar from "@/components/NavBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Hide NavBar on admin routes
  const hideNav = location.pathname.startsWith("/admin");

  return (
    <>
      {!hideNav && <NavBar />}
      <main>{children}</main>
    </>
  );
}
