import Image from "next/image";
import React from "react";

import authbg from "../../../../public/assets/images/auth_bg.png";

const AuthLayoutDesign = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Image
        src={authbg}
        alt="Cigar lounge"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default AuthLayoutDesign;
