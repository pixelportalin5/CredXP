import Image from "next/image";
import { coworkingPartnerLogos } from "@/config/coworkingLogos";

function LogoCard({ logo }: { logo: (typeof coworkingPartnerLogos)[number] }) {
  return (
    <div className="flex h-[72px] w-[152px] shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm sm:h-[86px] sm:w-[200px] sm:rounded-2xl">
      <div className="flex h-14 w-full items-center justify-center rounded-lg border border-slate-200/80 bg-white px-2 sm:h-16 sm:rounded-xl sm:px-3">
        <Image
          src={logo.src}
          alt={logo.name}
          width={180}
          height={64}
          className={logo.imageClassName}
        />
      </div>
    </div>
  );
}

export default function CoworkingPartnerMarquee() {
  return (
    <div className="partner-marquee group relative mt-6 -mx-4 overflow-hidden sm:-mx-6 lg:-mx-8">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-slate-50 to-transparent sm:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-slate-50 to-transparent sm:w-20" />

      <div className="partner-marquee-track flex w-max gap-4 px-4 sm:px-6 lg:px-8">
        {coworkingPartnerLogos.map((logo) => (
          <LogoCard key={`set-a-${logo.name}`} logo={logo} />
        ))}
        {coworkingPartnerLogos.map((logo, index) => (
          <div key={`set-b-${logo.name}`} aria-hidden="true">
            <LogoCard logo={logo} />
          </div>
        ))}
      </div>
    </div>
  );
}
