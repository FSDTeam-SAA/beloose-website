import { Wine } from "lucide-react";

export type Pairing = {
  brand: string;
  cigar: string;
  companion: string;
};

const defaultPairings: Pairing[] = [
  {
    brand: "Arturo Fuente",
    cigar: "OpusX Reserva",
    companion: "Pairs well with aged rum and dark chocolate",
  },
  {
    brand: "Padrón",
    cigar: "Padrón 1964 Anniversary",
    companion: "Pairs well with aged rum and dark chocolate",
  },
  {
    brand: "La Aroma de Cuba",
    cigar: "Broadway Maduro",
    companion: "Pairs well with aged rum and dark chocolate",
  },
];

const PerfectPairings = ({
  pairings = defaultPairings,
}: {
  pairings?: Pairing[];
}) => {
  return (
    <section
      className="store-section bg-[#0F0E0D] text-white"
      aria-labelledby="perfect-pairings-title"
    >
      <div className="container">
        <div>
          <h2
            id="perfect-pairings-title"
            className="font-playfair text-2xl text-[#F2E9DF] sm:text-3xl"
          >
            Perfect Pairings
          </h2>
          <p className="mt-1 text-xs text-[#A79E94] sm:text-sm">
            Cigars and their ideal companions
          </p>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pairings.map((pairing) => (
            <article
              key={`${pairing.brand}-${pairing.cigar}`}
              className="group flex min-h-[106px] items-center gap-4 rounded-xl border border-[#373330] bg-[#191715] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#CBA24A]/40 hover:bg-[#1D1A18] hover:shadow-[0_14px_35px_rgba(0,0,0,0.22)] sm:gap-5 sm:p-5"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#2A2725] text-[#E8E2DC] transition-colors group-hover:bg-[#CBA24A]/10 group-hover:text-[#D7AA46]">
                <Wine className="h-7 w-7" strokeWidth={1.8} />
              </div>

              <div className="min-w-0">
                <p className="truncate font-playfair text-xs text-[#9E978F]">
                  {pairing.brand}
                </p>
                <h3 className="mt-1 truncate font-playfair text-base text-[#E8E2DC]">
                  {pairing.cigar}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#C79A38]">
                  {pairing.companion}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PerfectPairings;
