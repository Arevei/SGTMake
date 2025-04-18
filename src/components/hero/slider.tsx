import { formatCurrency } from "@/lib/utils";
import { motion as m } from "framer-motion";
import Image from "next/image";
import LinkButton from "../shared/link-button";
import { HeroBanner } from "@prisma/client";

const Slider = ({
  slide,
  forLargeScreen,
}: {
  slide: HeroBanner;
  forLargeScreen: boolean;
}) => {
  return (
    <>
      <m.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute h-full w-full overflow-hidden after:absolute after:left-0 after:top-0 after:h-full after:w-full after:bg-[rgba(0,0,0,0.1)] after:content-['']"
      >
        <Image
          loading="eager"
          priority={true}
          sizes="min(1600px, 100vw)"
          src={forLargeScreen ? slide.imageUrl : slide.imageUrlSm}
          alt="slide images"
          fill
        />
      </m.div>
      <div className="absolute flex h-full flex-col items-start gap-3 overflow-hidden p-5 text-white md:max-w-[50%] md:justify-center md:ps-10">
        <m.h1
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-3xl font-bold md:text-5xl"
        >
          {slide.title}
        </m.h1>
        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.75 }}
          className="text-sm font-medium md:text-base md:font-normal"
        >
          {slide.description}
        </m.p>
        {(slide.basePrice || slide.offerPrice) ?<m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.75 }}
        >
          From{" "}
          <span className="font-Roboto font-medium text-slate-200 line-through decoration-white">
            {formatCurrency(slide.basePrice)}
          </span>{" "}
          <b className="font-Roboto">{formatCurrency(slide.offerPrice)}</b>
        </m.p> :""}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.75 }}
        >
          <LinkButton href={slide.url} className="font-normal">
            {(slide.basePrice || slide.offerPrice) ? "Buy Now" : "Explore More"}
          </LinkButton>
        </m.div>
      </div>
    </>
  );
};

export default Slider;
