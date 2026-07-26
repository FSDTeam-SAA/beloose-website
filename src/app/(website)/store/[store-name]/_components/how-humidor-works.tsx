import {
  CircleCheck,
  MapPin,
  ScanLine,
  Search,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Scan",
    description:
      "Scan the QR code attached to any product in the humidor with your smartphone.",
    icon: ScanLine,
  },
  {
    number: "02",
    title: "Search",
    description:
      "Instantly access detailed product information—origin, blend, strength, and flavor notes.",
    icon: Search,
  },
  {
    number: "03",
    title: "Locate",
    description:
      "See the exact humidor and shelf location, so your cigar is easy to find in store.",
    icon: MapPin,
  },
  {
    number: "04",
    title: "Enjoy",
    description:
      "Make a confident choice and enjoy a faster, more personal shopping experience.",
    icon: CircleCheck,
  },
];

const HowHumidorWorks = () => {
  return (
    <section
      aria-labelledby="how-humidor-works-title"
      className="store-section relative isolate overflow-hidden bg-[#17110B] px-4 text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(203,162,74,0.11),transparent_48%)]"
      />

      <div className="container">
        <header className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-[#CBA24A]/25 bg-[#CBA24A]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D7AA46]">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            How Humidor411 Works
          </p>
          <h2
            id="how-humidor-works-title"
            className="mt-3 text-balance font-playfair text-2xl font-semibold leading-tight text-[#F5E7D0] sm:text-3xl lg:text-4xl"
          >
            A Seamless Four-Step Experience
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#AFA59A]">
            From the first scan to the perfect selection, finding your next
            cigar takes only a few simple steps.
          </p>
        </header>

        <div className="relative mt-7 sm:mt-9">
          <div
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-gradient-to-r from-transparent via-[#CBA24A]/35 to-transparent lg:block"
          />

          <ol className="relative grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
              <li
                key={step.title}
                className="group relative rounded-2xl border border-white/[0.08] bg-[#211A14]/85 p-5 shadow-[0_12px_34px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-1 hover:border-[#CBA24A]/35 hover:bg-[#251C14]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-[#CBA24A]/30 bg-[#CBA24A]/10 text-[#D7AA46] transition group-hover:bg-[#CBA24A]/15">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-playfair text-2xl text-[#CBA24A]/35">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-4 font-playfair text-lg font-semibold text-[#F2DEBB]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#AFA59A]">
                  {step.description}
                </p>

                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-3 left-1/2 z-10 h-3 w-px bg-[#CBA24A]/30 sm:hidden"
                  />
                )}
              </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default HowHumidorWorks;
