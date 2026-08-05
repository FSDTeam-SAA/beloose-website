"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { getContactInfo, getSocialMedia } from "@/lib/retailerLanding";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

const platformLinks = [
  { label: "Home", href: "/" },
  { label: "For Retailers", href: "/#for-retailers" },
  { label: "THE PLATFORM", href: "/#the-platform" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Business Benefits", href: "/#business-benefits" },
];

const fallbackSocialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com",
    icon: <FaFacebookF className="h-[15px] w-[15px]" />,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com",
    icon: <FaInstagram className="h-[15px] w-[15px]" />,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com",
    icon: <FaLinkedinIn className="h-[15px] w-[15px]" />,
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: <FaTwitter className="h-[15px] w-[15px]" />,
  },
];

const socialIcons = {
  facebook: <FaFacebookF className="h-[15px] w-[15px]" />,
  instagram: <FaInstagram className="h-[15px] w-[15px]" />,
  linkedin: <FaLinkedinIn className="h-[15px] w-[15px]" />,
  twitter: <FaTwitter className="h-[15px] w-[15px]" />,
  x: <FaTwitter className="h-[15px] w-[15px]" />,
};

const Footer = () => {
  const pathname = usePathname();
  const contactQuery = useQuery({
    queryKey: ["contact-info"],
    queryFn: ({ signal }) => getContactInfo(signal),
    staleTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  const socialQuery = useQuery({
    queryKey: ["social-media"],
    queryFn: ({ signal }) => getSocialMedia(signal),
    staleTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  const contact = contactQuery.data;
  const socialMedia = socialQuery.data;
  const email = contact?.email?.trim() || "support@humidor411.com";
  const phone = contact?.phone?.trim() || "+1 (555) 123-4567";
  const address = contact?.address?.trim() || "123 Cidre Street, City, State, ZIP";
  const phoneHref = `tel:${phone.replace(/[^+\d]/g, "")}`;
  const description = socialMedia?.description?.trim() || "The digital operating platform for premium cigar retailers. Digitizing the humidor experience, one shop at a time.";
  const socialLinks = socialMedia?.isActive
    ? socialMedia.socialLinks
        ?.filter((item) => item.isActive && item.platform && item.url)
        .map((item) => ({
          label: item.platform!,
          href: item.url!,
          icon: socialIcons[item.platform!.toLowerCase() as keyof typeof socialIcons],
        }))
        .filter((item) => item.icon) || fallbackSocialLinks
    : fallbackSocialLinks;

  if (pathname.startsWith("/store/")) return null;

  return (
    <footer className="relative overflow-hidden border-t border-[#271c0f] bg-[#0e0904] text-[#d7c4a7]">
      <Image
        src="/assets/images/footer_bg.png"
        alt=""
        fill
        sizes="100vw"
        className="z-0 object-cover object-center"
        aria-hidden="true"
      />
      <div className="absolute inset-0 z-[1] bg-[#090503]/82" />
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-[#0e0904]/65 via-[#0e0904]/42 to-[#0e0904]/88" />

      <div className="pointer-events-none absolute -left-12 top-0 z-[3] h-[190px] w-[310px] opacity-35 blur-[1px] sm:w-[360px]">
        <div className="absolute left-0 top-3 h-24 w-32 rounded-[50%] border-l border-t border-white/25 blur-sm" />
        <div className="absolute left-10 top-7 h-32 w-44 rounded-[50%] border-l border-b border-white/20 blur-sm" />
        <div className="absolute left-24 top-0 h-44 w-40 rounded-[50%] border-l border-white/15 blur-md" />
        <div className="absolute bottom-0 left-16 h-10 w-52 rotate-12 rounded-full bg-white/10 blur-xl" />
      </div>
      <div className="pointer-events-none absolute -right-14 top-14 z-[3] h-[170px] w-[330px] opacity-30 blur-[1px] sm:w-[390px]">
        <div className="absolute right-2 top-0 h-28 w-52 rounded-[50%] border-r border-t border-white/20 blur-sm" />
        <div className="absolute right-20 top-8 h-28 w-44 rounded-[50%] border-r border-b border-white/20 blur-sm" />
        <div className="absolute bottom-0 right-10 h-12 w-64 -rotate-12 rounded-full bg-white/10 blur-xl" />
      </div>

      <div className="container relative z-[4] px-4 py-6 sm:px-6 md:py-7 lg:px-8 xl:px-10">
        <div className="grid gap-10 md:grid-cols-[minmax(260px,1fr)_170px_minmax(260px,1fr)] md:gap-12 lg:gap-20">
          <div className="max-w-[410px]">
             <Link href="/">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="w-[48px] h-[45px]"
            />
          </Link>

            <p className="mt-4 max-w-[330px] text-sm md:text-base leading-normal text-[#BFBFBF]">
              {description}
            </p>

            <ul className="mt-8 flex flex-wrap items-center gap-5" aria-busy={socialQuery.isLoading}>
              {socialLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="flex h-8 w-8 items-center justify-center rounded-[3px] bg-primary text-white transition hover:bg-[#d0a36b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a629] "
                  >
                    {item.icon}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base md:text-lg xl:text-xl font-semibold leading-normal text-[#F7E4B3]">
              Platform
            </h3>
            <ul className="mt-5 space-y-3">
              {platformLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="inline-flex text-xs md:text-sm leading-normal text-[#BFBFBF] transition hover:text-[#f0d49e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a629]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:justify-self-end">
            <h3 className="text-base md:text-lg xl:text-xl font-semibold leading-normal text-[#F7E4B3]">
              Contact Us
            </h3>
            <ul className="mt-5 space-y-4 text-[13px] leading-5 text-[#d5c7b5]/78" aria-busy={contactQuery.isLoading}>
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 flex-none text-[#BFBFBF]" />
                <Link
                  href={`mailto:${email}`}
                  className="text-xs md:text-sm leading-normal text-[#BFBFBF] transition hover:text-[#f0d49e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a629]"
                >
                  {email}
                </Link>
              </li>
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 flex-none text-[#BFBFBF]" />
                <Link
                  href={phoneHref}
                  className="text-xs md:text-sm leading-normal text-[#BFBFBF] transition hover:text-[#f0d49e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a629]"
                >
                  {phone}
                </Link>
              </li>
              <li className="flex max-w-[270px] gap-2">
                <MapPin   className="mt-0.5 h-4 w-4 flex-none text-[#BFBFBF]" />
                <span className="text-xs md:text-sm leading-normal text-[#BFBFBF]">
                  {address}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-11  border-t border-[#FFFFFF33] pt-6 md:pt-7 text-center">
          <p className="text-xs font-normal leading-normal text-[#BFBFBF]">
            © {new Date().getFullYear()} Humidor411. All rights reserved. The Digital Operating
            Platform for Premium Cigar Retailers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
