import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

function Hero() {
  return (
    <div className="flex flex-col gap-7 justify-center items-center h-screen bg-[radial-gradient(ellipse_200%_100%_at_bottom_center,#2B72E3,#000000_66%)]">
      <p className="text-6xl tracking-wide font-bold text-white">StudyMate</p>
      <p className="text-2xl font-bold text-gray-300">Learn, Quiz, and Test with AI</p>
      <Link href={"/dashboard"}>
        <Button className="text-white py-5 px-10 text-xl font-bold rounded-full bg-[#1a56b6] hover:bg-[#3568b9]">
          Get Started
        </Button>
      </Link>
    </div>
  );
}

export default Hero;
