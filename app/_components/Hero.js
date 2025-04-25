import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, BrainCircuit, MessageSquare, Star } from "lucide-react";

function Hero() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2e4d55] via-[#be9b7b] to-[#80a984] text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-4 md:p-6">
        <div className="flex items-center">
          <BookOpen className="w-6 h-6 mr-2" />
          <span className="text-xl font-bold">StudyMate</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="#features"
            className="hover:text-amber-200 transition-colors"
          >
            Features
          </a>
          <a href="#pricing" className="hover:text-amber-200 transition-colors">
            Pricing
          </a>
          <a href="#about" className="hover:text-amber-200 transition-colors">
            About
          </a>
          <Link href="/dashboard">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-md px-4 py-2">
              Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="flex flex-col items-center mb-16">
          <div className="mb-4">
            <BookOpen className="w-12 h-12 inline-block" />
            <span className="text-3xl md:text-4xl font-bold ml-2">
              StudyMate
            </span>
          </div>
          <h1 className="text-4xl md:text-7xl font-bold mb-6">
            Your AI Study Companion
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
            Transform your notes into interactive learning experiences with
            AI-powered magic ✨
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/dashboard">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white text-lg rounded-full px-8 py-6 flex items-center">
                Go to Dashboard <span className="ml-2">→</span>
              </Button>
            </Link>
            <Button className="bg-teal-600/40 backdrop-blur-sm hover:bg-teal-600/60 text-white text-lg rounded-full px-8 py-6 flex items-center">
              Watch How It Works <span className="ml-2">▶</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-24">
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-amber-300">
              10,000+
            </p>
            <p className="text-lg">Active Students</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-amber-300">
              50,000+
            </p>
            <p className="text-lg">Notes Created</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-amber-300">98%</p>
            <p className="text-lg">Success Rate</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
            <div className="bg-blue-500/20 w-16 h-16 flex items-center justify-center rounded-xl mb-4 mx-auto">
              <BookOpen className="w-8 h-8 text-amber-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">Smart Notes</h3>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
            <div className="bg-blue-500/20 w-16 h-16 flex items-center justify-center rounded-xl mb-4 mx-auto">
              <BrainCircuit className="w-8 h-8 text-amber-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">Auto Quiz Gen</h3>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
            <div className="bg-blue-500/20 w-16 h-16 flex items-center justify-center rounded-xl mb-4 mx-auto">
              <MessageSquare className="w-8 h-8 text-amber-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Chat</h3>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
            <div className="bg-blue-500/20 w-16 h-16 flex items-center justify-center rounded-xl mb-4 mx-auto">
              <Star className="w-8 h-8 text-amber-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">Practice Tests</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
