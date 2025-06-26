import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu } from "lucide-react";

export function Hero() {
  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-headline font-bold">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-primary via-accent to-primary text-transparent bg-clip-text">
              Predict
            </span>{" "}
            the Future
          </h1>{" "}
          of Crypto with{" "}
          <h2 className="inline">
            <span className="inline bg-gradient-to-r from-primary via-accent to-primary text-transparent bg-clip-text">
              AI
            </span>{" "}
            Foresight
          </h2>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          Leverage cutting-edge AI sentiment analysis to make smarter
          predictions in the volatile crypto market. Join ForesightX and turn
          insight into opportunity.
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <Link href="/dashboard">
            <Button className="w-full md:w-1/3 group">
              Get Started <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="z-10">
         <Cpu
          size={200}
          className="text-primary/70 animate-pulse"
          strokeWidth={1}
        />
      </div>

      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#2f2f2f_1px,transparent_1px)] [background-size:16px_16px]"></div>
    </section>
  );
}
