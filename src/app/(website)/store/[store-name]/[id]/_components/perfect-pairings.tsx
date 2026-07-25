import { Wine } from "lucide-react";

type PerfectPairingsProps = {
  note?: string;
  pairings?: string[];
};

const defaultPairings = ["Aged Rum", "Single Malt Scotch", "Dark Chocolate"];

const PerfectPairings = ({
  note = "Rich, thoughtfully selected companions can complement the character of a premium cigar.",
  pairings = defaultPairings,
}: PerfectPairingsProps) => {
  if (!pairings.length) return null;

  return (
    <section className="mt-10" aria-labelledby="perfect-pairings-title">
      <h2
        id="perfect-pairings-title"
        className="flex items-center gap-2 font-playfair text-lg text-[#F5E7D0] sm:text-xl"
      >
        <Wine className="h-5 w-5 text-[#D7AA46]" strokeWidth={1.8} />
        Perfect Pairings
      </h2>

      <div className="mt-4 rounded-xl border border-white/[0.1] bg-[#191715] p-4 sm:p-5">
        <p className="text-sm italic leading-6 text-[#9D958B]">
          “{note}”
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {pairings.map((pairing) => (
            <div
              key={pairing}
              className="flex min-h-[68px] flex-col items-center justify-center rounded-lg bg-[#2A2725] px-3 py-3 text-center transition hover:bg-[#302D2A]"
            >
              <Wine
                className="h-5 w-5 text-[#F0EBE5]"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <p className="mt-1.5 text-xs text-[#F0EBE5]">{pairing}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PerfectPairings;
