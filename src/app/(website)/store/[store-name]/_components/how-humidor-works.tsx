const steps = [
  {
    number: "01",
    title: "Scan",
    description:
      "Scan the QR code attached to any product in the humidor with your smartphone.",
  },
  {
    number: "02",
    title: "Search",
    description:
      "Instantly access detailed product information—origin, blend, strength, and flavor notes.",
  },
  {
    number: "03",
    title: "Locate",
    description:
      "Customers scan the QR code attached to any product in your humidor with their smartphone.",
  },
  {
    number: "04",
    title: "Enjoy",
    description:
      "Staff-free discovery transforms the shopping experience into a curated, premium journey.",
  },
];

const HowHumidorWorks = () => {
  return (
    <section
      aria-labelledby="how-humidor-works-title"
      className="overflow-hidden bg-[#1E1409] px-4 py-10 text-[#E9D09C] sm:py-11 lg:py-10"
    >
      <div className="container">
        <header className="text-center">
          <p className="text-[8px] font-medium uppercase tracking-[0.08em] text-[#B58A2F] sm:text-[9px]">
            How Humidor411 Works
          </p>
          <h2
            id="how-humidor-works-title"
            className="mt-3 font-[family-name:var(--font-playfair)] text-3xl font-semibold leading-tight text-[#EED7A5] sm:text-[34px] lg:text-[36px]"
          >
            A Seamless Four-Step Experience
          </h2>
        </header>

        <div className="relative mt-8 sm:mt-9">
          <div
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-[23px] hidden h-px bg-gradient-to-r from-transparent via-[#8E681D]/55 to-transparent lg:block"
          />

          <ol className="relative grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {steps.map((step) => (
              <li
                key={step.title}
                className="relative px-2 text-center"
              >
                <div className="relative z-10 mx-auto flex h-[47px] w-[47px] items-center justify-center rounded-[2px] border border-[#8F681D]/65 bg-[#2B190B] font-[family-name:var(--font-playfair)] text-xs font-semibold text-[#D6AA45] shadow-[0_0_0_10px_#1B0F06]">
                  {step.number}
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-playfair)] text-xs font-semibold text-[#EBD4A4]">
                  {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-[175px] text-[9px] leading-[1.3] text-[#BFA77E]/70 sm:text-[10px]">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default HowHumidorWorks;
