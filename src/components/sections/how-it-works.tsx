import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal, Wallet, Eye } from "lucide-react";

interface FeatureProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: <Wallet />,
    title: "Connect Your Wallet",
    description:
      "Easily and securely connect your MetaMask wallet to start participating in prediction rounds.",
  },
  {
    icon: <Eye />,
    title: "Analyze AI Sentiment",
    description:
      "Gain an edge with our Gemini-powered AI, which analyzes market sentiment from news headlines.",
  },
  {
    icon: <Medal />,
    title: "Make Your Prediction",
    description:
      "Predict whether the price will go UP or DOWN. Correct predictions win a share of the prize pool.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="howItWorks" className="container text-center py-24 sm:py-32">
      <h2 className="text-3xl md:text-4xl font-heading font-bold">
        How It{" "}
        <span className="bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
          Works
        </span>
      </h2>
      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
        Follow these simple steps to start your prediction journey.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map(({ icon, title, description }: FeatureProps) => (
          <Card
            key={title}
            className="bg-card/60"
          >
            <CardHeader>
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
                {icon}
              </div>
              <CardTitle className="font-heading">{title}</CardTitle>
            </CardHeader>

            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
