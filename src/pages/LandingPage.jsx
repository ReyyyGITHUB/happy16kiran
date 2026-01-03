import React from "react";
import HeroTitle from "../components/hero/HeroTitle";
import Navbar from "../components/navbar/Navbar";
import DivHero from "../components/divider-hero/DivHero";
import PersonalMsg from "../components/personal/PersonalMsg";
import About from "../components/about/About";
import Gallery from "../components/gallery/Gallery";
import ForYour16 from "@/components/for-your-16/ForYour16";
import Photobooth from "../components/photobooth/Photobooth";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bgPrimary text-textPrimary">
      <Navbar />
      <section className="relative overflow-hidden">
        <div className="mx-auto flex w-full max-w-275 flex-col items-center px-4 sm:px-6">
          <div className="w-full rounded-3xl bg-bgSecondary/60 px-4 py-10 sm:px-8 sm:py-14">
            <HeroTitle />
            <DivHero />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-bgPrimary to-transparent" />
      </section>
      <div className="-mt-6">
        <PersonalMsg />
      </div>
      <div className="mt-8 sm:mt-12 md:mt-16 pb-10 sm:pb-14 md:pb-20">
        <About />
      </div>
      <div className="mt-8 sm:mt-12 md:mt-16 pb-10 sm:pb-14 md:pb-20">
        <Gallery />
      </div>
      <div className="mt-8 sm:mt-12 md:mt-16 pb-0 sm:pb-0 md:pb-0">
        <ForYour16 />
      </div>
      <div className="mt-8 sm:mt-12 md:mt-16 pb-0 sm:pb-0 md:pb-0">
        <ForYour16 />
      </div>
      <div className="mt-8 sm:mt-12 md:mt-16 pb-10 sm:pb-14 md:pb-20">
        <Photobooth />
      </div>
    </main>
  );
}
