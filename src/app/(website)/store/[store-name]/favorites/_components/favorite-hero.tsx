import Image from "next/image";

const FavoriteHero = () => {
  return (
    <section className="bg-[#1B0F06] px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-20 lg:pt-36">
      <div className="container">
        <div className="relative isolate flex min-h-[190px] items-center justify-center overflow-hidden rounded-lg bg-[#100A08] px-5 py-10 text-center sm:min-h-[210px] sm:px-8 lg:min-h-[220px]">
          <Image
            src="/assets/images/favorite-hero.jpg"
            alt="Premium cigars beside a glass of whiskey"
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1180px"
            className="z-[-2] object-cover object-[center_68%]"
          />
          <div className="absolute inset-0 z-[-1] bg-black/45" />
          <div className="absolute inset-0 z-[-1] bg-[linear-gradient(90deg,rgba(9,5,4,0.5),rgba(9,5,4,0.12)_45%,rgba(9,5,4,0.3))]" />

          <div className="mx-auto max-w-[800px]">
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold leading-tight text-[#F7E8CF] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] sm:text-4xl lg:text-[42px]">
              Your Favorite Cigars, All in One Place
            </h1>
            <p className="mx-auto mt-2 max-w-[700px] text-xs leading-relaxed text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-sm">
              Easily access every cigar you&apos;ve saved, compare your favorites,
              and quickly locate them whenever you
              <br className="hidden sm:block" /> visit the humidor.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FavoriteHero;
