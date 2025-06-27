import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { ScrollAnimation } from "@/components/scroll-animation";

export default function LandingPage() {
  return (
    <>
      <ScrollAnimation>
        <Hero />
      </ScrollAnimation>
      <ScrollAnimation delay={0.2}>
        <HowItWorks />
      </ScrollAnimation>
      <ScrollAnimation delay={0.4}>
        <footer className="text-center p-8 text-muted-foreground text-sm">
          ForesightX &copy; {new Date().getFullYear()}
        </footer>
      </ScrollAnimation>
    </>
  );
}
