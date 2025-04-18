"use client";

import { ChevronsLeft, ChevronsRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Slider from "./slider";
import { HeroBanner } from "@prisma/client";

const Hero = ({ slides }: { slides: HeroBanner[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const prevSlide = () => {
    setProgress(0);
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = useCallback(() => {
    setProgress(0);
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, slides.length]);

  const goToSlide = (slideIndex: number) => {
    setProgress(0);
    setCurrentIndex(slideIndex);
  };

  const togglePause = () => {
    setIsPaused((prevPaused) => !prevPaused);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (!isPaused) {
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            nextSlide(); // Call nextSlide function when progress reaches 100
            return 100;
          } else {
            return prevProgress + 1;
          }
        });
      }, 70);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPaused, progress, nextSlide]);

  return (
    <section className="py-4" id="home">
      <div className="group relative mx-auto h-[26rem] max-w-7xl px-4 md:h-[36rem]">
        {/* Slider for Large Screen */}
        {slides.map(
          (slide, i) =>
            currentIndex === i && (
              <div
                className="relative hidden h-full w-full overflow-hidden rounded-2xl md:block"
                key={i}
              >
                <Slider slide={slide} forLargeScreen={true} />
              </div>
            ),
        )}
        {/* Slider for Small Screen */}
        {slides.map(
          (slide, i) =>
            currentIndex === i && (
              <div
                className="relative h-full w-full overflow-hidden rounded-2xl md:hidden"
                key={i}
              >
                <Slider slide={slide} forLargeScreen={false} />
              </div>
            ),
        )}

        <div className="absolute bottom-0 left-0 z-30 flex items-center gap-2 pb-8 ps-10 md:left-auto md:right-0 md:pe-20">
          {/* Slide Numbers */}
          <div className="me-2 flex items-center gap-2.5">
            {slides.map((_, index) => (
              <span
                className={`${
                  currentIndex === index
                    ? "text-white"
                    : "text-[hsla(0,0%,100%,.60)]"
                } cursor-pointer hover:text-white`}
                onClick={() => goToSlide(index)}
                key={index}
              >
                0{index + 1}
              </span>
            ))}
          </div>
          {/* Progress Bar */}
          <span className="h-1 w-16 rounded-full bg-[hsla(0,0%,100%,.25)]">
            <span
              className="block h-full rounded-full bg-white"
              data-percent={progress}
              style={{ width: `${progress}%` }}
            ></span>
          </span>
          {/* Controls */}
          <ChevronsLeft
            onClick={prevSlide}
            className="hidden cursor-pointer text-[hsla(0,0%,100%,.70)] hover:text-white md:block"
          />
          {isPaused ? (
            <Play
              strokeWidth={0}
              onClick={togglePause}
              className="hidden cursor-pointer fill-[hsla(0,0%,100%,.70)] hover:fill-white md:block"
            />
          ) : (
            <Pause
              strokeWidth={0}
              onClick={togglePause}
              className="hidden cursor-pointer fill-[hsla(0,0%,100%,.70)] hover:fill-white md:block"
            />
          )}
          <ChevronsRight
            onClick={nextSlide}
            className="hidden cursor-pointer text-[hsla(0,0%,100%,.70)] hover:text-white md:block"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
