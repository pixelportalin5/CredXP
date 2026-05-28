export interface CoworkingLogo {
  name: string;
  src: string;
  imageClassName: string;
}

export const coworkingPartnerLogos: CoworkingLogo[] = [
  {
    name: "WeWork",
    src: "/logos/wework%20logo.avif",
    imageClassName: "h-11 w-auto object-contain",
  },
  {
    name: "AWFIS",
    src: "/logos/Awfis.png",
    imageClassName: "h-11 w-auto object-contain",
  },
  {
    name: "Smartworks",
    src: "/logos/smartworks.png",
    imageClassName: "h-12 w-auto scale-[1.55] object-contain",
  },
  {
    name: "BHIVE",
    src: "/logos/Bhive.png",
    imageClassName: "h-11 w-auto scale-[1.3] object-contain",
  },
  {
    name: "Regus",
    src: "/logos/Reagus.png",
    imageClassName: "h-11 w-auto scale-[1.32] object-contain",
  },
  {
    name: "91springboard",
    src: "/logos/91Springboard.png",
    imageClassName: "h-11 w-auto scale-[2.1] object-contain",
  },
];

export const topCoworkingPartnerLogos = coworkingPartnerLogos.slice(0, 4);