import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <footer className="text-center p-8 text-muted-foreground text-sm">
        ForesightX &copy; {new Date().getFullYear()}
      </footer>
    </>
  );
}
