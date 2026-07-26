import type { ReactNode } from "react";
import StoreEntryGate from "./_components/store-entry-gate";
import StoreExperience from "./_components/store-experience";
import UserFooter from "./_components/user-footer";
import UserNavbar from "./_components/user-navbar";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <StoreEntryGate>
      <div className="flex min-h-dvh min-w-0 flex-col bg-[#0F0E0D]">
        <UserNavbar />
        <StoreExperience>{children}</StoreExperience>
        <UserFooter />
      </div>
    </StoreEntryGate>
  );
}
