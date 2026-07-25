import Image from "next/image";

type Props = {
  name: string;
  businessName?: string;
  profilePicture?: string;
  banner?: string;
  editable?: boolean;
  onImageChange?: (file?: File) => void;
};

export default function ProfileHero({ name, businessName, profilePicture, banner, editable, onImageChange }: Props) {
  const initials = name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
  const picture = <span className="relative grid h-full w-full place-items-center overflow-hidden rounded-md bg-[#32200f] font-playfair text-lg text-[#d5a744]">{profilePicture ? <Image src={profilePicture} alt="Shop profile" fill sizes="68px" className="object-cover"/> : initials}</span>;

  return <section className="relative h-[140px] overflow-hidden rounded-md bg-[#251609]">
    {banner ? <Image src={banner} alt="" fill sizes="100vw" className="object-cover"/> : <div className="absolute inset-0 bg-[url('/assets/images/footer_bg.png')] bg-cover bg-center"/>}
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.82),rgba(18,9,3,.25),rgba(19,10,4,.58))]"/>
    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#402b17] to-transparent"/>
    <div className="absolute bottom-4 left-3 flex items-end gap-3">
      {editable ? <label className="relative h-[68px] w-[68px] shrink-0 cursor-pointer rounded-md border border-[#bd8a2d] p-px" aria-label="Change shop profile image">{picture}<input className="sr-only" type="file" accept="image/*" onChange={event => onImageChange?.(event.target.files?.[0])}/></label> : <span className="relative h-[68px] w-[68px] shrink-0 rounded-md border border-[#bd8a2d] p-px">{picture}</span>}
      <div className="pb-2"><h2 className="font-playfair text-lg font-semibold leading-none text-[#f3dca5]">{businessName || name}</h2><p className="mt-1 text-[9px] text-[#b99b66]">Premium Retailer · Humidor411 Partner</p></div>
    </div>
  </section>;
}
