import type { ReactNode } from "react";
import UserFooter from "./_components/user-footer";
import UserNavbar from "./_components/user-navbar";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <UserNavbar />
      {children}
      <UserFooter />
    </>
  );
}
