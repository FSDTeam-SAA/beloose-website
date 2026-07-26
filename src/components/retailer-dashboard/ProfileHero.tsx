import Image from "next/image";
import { BadgeCheck } from "lucide-react";

type Props = {
  name: string;
  businessName?: string;
  profilePicture?: string;
  banner?: string;
  verified?: boolean;
  expanded?: boolean;
  bannerPreviewing?: boolean;
  editable?: boolean;
  onImageChange?: (file?: File) => void;
};

export default function ProfileHero({ name, businessName, profilePicture, banner, verified, expanded, bannerPreviewing, editable, onImageChange }: Props) {
  const initials = name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
  const picture = <span className="relative grid h-full w-full place-items-center overflow-hidden rounded-md bg-[#32200f] font-playfair text-lg text-[#d5a744]">{profilePicture ? <Image src={profilePicture} alt="Shop profile" fill sizes="68px" className="object-cover"/> : initials}</span>;

  return <section className={`relative overflow-hidden rounded-md bg-[#251609] ${expanded ? "h-[220px] sm:h-[280px]" : "h-[140px]"}`}>
    {banner ? <Image src={banner} alt="" fill sizes="100vw" className="object-cover"/> : <div className="absolute inset-0 bg-[url('/assets/images/footer_bg.png')] bg-cover bg-center"/>}
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.82),rgba(18,9,3,.25),rgba(19,10,4,.58))]"/>
    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#402b17] to-transparent"/>
    {bannerPreviewing && (
      <span className="absolute right-3 top-3 rounded-full border border-[#d2a13d]/40 bg-[#211305]/85 px-2.5 py-1 text-[9px] font-medium text-[#f0d796] backdrop-blur-sm">
        Banner preview
      </span>
    )}
    <div className="absolute bottom-4 left-3 flex items-end gap-3">
      {editable ? <label className="relative h-[68px] w-[68px] shrink-0 cursor-pointer rounded-md border border-[#bd8a2d] p-px" aria-label="Change shop profile image">{picture}<input className="sr-only" type="file" accept="image/*" onChange={event => onImageChange?.(event.target.files?.[0])}/></label> : <span className="relative h-[68px] w-[68px] shrink-0 rounded-md border border-[#bd8a2d] p-px">{picture}</span>}
      <div className="pb-2">
        <div className="flex items-center gap-1.5">
          <h2 className="font-playfair text-lg font-semibold leading-none text-[#f3dca5]">{businessName || name}</h2>
          {verified && (
            <span
              title="Verified retailer"
              aria-label="Verified retailer"
              className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-emerald-300"
            >
              <BadgeCheck size={11} aria-hidden="true" />
              Verified
            </span>
          )}
        </div>
        <p className="mt-1 text-[9px] text-[#b99b66]">Premium Retailer · Humidor411 Partner</p>
      </div>
    </div>
  </section>;
}
