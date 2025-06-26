"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Loader2, BarChart, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeCryptoSentiment, type AnalyzeCryptoSentimentOutput } from "@/ai/flows/analyze-crypto-sentiment";
import { useWallet } from "@/hooks/use-wallet";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";
import type { Prediction } from "@/lib/types";

const MOCK_HEADLINES = "Bitcoin hits new all-time high, Ethereum merge successful, Solana network experiences another outage, Dogecoin price pumps after celebrity tweet, SEC announces new crypto regulations.";

const ROUND_DURATION_SECONDS = 300; // 5 minutes

export function DashboardClient() {
  const { toast } = useToast();
  const { isConnected, connectWallet } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState<"UP" | "DOWN" | null>(null);
  const [sentiment, setSentiment] = useState<AnalyzeCryptoSentimentOutput | null>(null);
  const [isLoadingSentiment, setIsLoadingSentiment] = useState(true);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_SECONDS);
  const [roundId, setRoundId] = useState(Math.floor(Date.now() / (ROUND_DURATION_SECONDS * 1000)));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setRoundId(Math.floor(Date.now() / (ROUND_DURATION_SECONDS * 1000)));
          return ROUND_DURATION_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    async function getSentiment() {
      setIsLoadingSentiment(true);
      try {
        const result = await analyzeCryptoSentiment({ newsHeadlines: MOCK_HEADLINES });
        setSentiment(result);
      } catch (error) {
        console.error("Error fetching sentiment:", error);
        toast({
          variant: "destructive",
          title: "AI Error",
          description: "Could not fetch sentiment analysis.",
        });
      } finally {
        setIsLoadingSentiment(false);
      }
    }
    getSentiment();
  }, [roundId, toast]);

  const handlePredict = async (prediction: "UP" | "DOWN") => {
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet to make a prediction.",
      });
      return;
    }

    setIsSubmitting(prediction);
    toast({
      title: "Transaction in Process",
      description: "Your prediction is being submitted to the blockchain...",
    });

    // Simulate smart contract call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // On success
    const newPrediction: Prediction = {
      id: crypto.randomUUID(),
      round: `Round #${roundId}`,
      asset: "BTC/USD",
      prediction: prediction,
      status: "PENDING",
      timestamp: Date.now(),
    };

    try {
      const existingPredictions: Prediction[] = JSON.parse(localStorage.getItem("userPredictions") || "[]");
      localStorage.setItem("userPredictions", JSON.stringify([newPrediction, ...existingPredictions]));
    } catch (error) {
      console.error("Failed to save prediction", error);
    }
    
    toast({
      title: "Transaction Successful",
      description: `Your prediction for ${prediction} has been placed.`,
    });
    setIsSubmitting(null);
  };
  
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  const sentimentScoreForChart = useMemo(() => {
    if (!sentiment) return 0;
    // convert sentiment score from [-1, 1] to [0, 100]
    return (sentiment.sentimentScore + 1) * 50;
  }, [sentiment]);
  
  const chartColor = useMemo(() => {
    if (sentimentScoreForChart > 60) return "hsl(var(--chart-2))";
    if (sentimentScoreForChart < 40) return "hsl(var(--destructive))";
    return "hsl(var(--chart-4))";
  }, [sentimentScoreForChart]);

  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="font-headline text-2xl">Active Round #{roundId}</CardTitle>
                <CardDescription>Predict the price of BTC/USD</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Round ends in</p>
                <p className="text-2xl font-bold font-mono text-primary">{minutes}:{seconds}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-[2/1] bg-muted/30 rounded-lg flex items-center justify-center p-4 my-4">
              <BarChart className="w-24 h-24 text-muted-foreground/50" />
              <p className="absolute text-muted-foreground">Live Chart Coming Soon</p>
            </div>
            
            {!isConnected && (
              <Card className="bg-accent/10 border-accent/50 text-center">
                <CardContent className="p-6">
                  <Info className="mx-auto h-8 w-8 text-accent mb-2" />
                  <h3 className="font-bold">Connect Wallet to Participate</h3>
                  <p className="text-muted-foreground text-sm mb-4">You need to connect your wallet before you can make a prediction.</p>
                  <Button onClick={connectWallet} variant="secondary">Connect Wallet</Button>
                </CardContent>
              </Card>
            )}

            {isConnected && (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className="py-8 text-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 border-2 border-green-500"
                  onClick={() => handlePredict("UP")}
                  disabled={!!isSubmitting}
                >
                  {isSubmitting === "UP" ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <ArrowUp className="h-6 w-6 mr-2" /> UP
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  className="py-8 text-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border-2 border-red-500"
                  onClick={() => handlePredict("DOWN")}
                  disabled={!!isSubmitting}
                >
                  {isSubmitting === "DOWN" ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <ArrowDown className="h-6 w-6 mr-2" /> DOWN
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl">AI Sentiment Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSentiment ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sentiment ? (
                <div className="space-y-4">
                  <ChartContainer
                    config={{
                      score: { label: "Sentiment", color: chartColor },
                    }}
                    className="mx-auto aspect-square h-full w-full max-h-[200px]"
                  >
                    <RadialBarChart
                      startAngle={-270}
                      endAngle={90}
                      innerRadius="70%"
                      outerRadius="85%"
                      barSize={20}
                      data={[{ name: "score", value: sentimentScoreForChart, fill: "var(--color-score)" }]}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={10}
                        className="fill-muted"
                      />
                       <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-3xl font-bold font-mono">
                        {sentiment.sentimentScore.toFixed(2)}
                      </text>
                       <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-sm">
                        Score
                      </text>
                    </RadialBarChart>
                  </ChartContainer>

                  <p className="text-sm text-muted-foreground italic text-center">
                    "{sentiment.sentimentSummary}"
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-40">
                  <AlertTriangle className="w-8 h-8 mb-2" />
                  <p>Could not load AI sentiment.</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl">Pool Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
               <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Prize Pool</span>
                  <span className="font-mono font-bold text-lg">10.43 ETH</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Up Pool</span>
                  <span className="font-mono text-green-400">5.21 ETH</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Down Pool</span>
                  <span className="font-mono text-red-400">5.22 ETH</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
