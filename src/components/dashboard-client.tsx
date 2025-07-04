"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowUp, ArrowDown, Loader2, Info, AlertTriangle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeCryptoSentiment, type AnalyzeCryptoSentimentOutput } from "@/ai/flows/analyze-crypto-sentiment";
import { useWallet } from "@/hooks/use-wallet";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  RadialBar, 
  RadialBarChart, 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PolarAngleAxis
} from "recharts";
import type { Prediction } from "@/lib/types";
import { generateNews, type GenerateNewsOutput } from "@/ai/flows/generate-news-flow";
import { generateMarketReport, type GenerateMarketReportOutput } from "@/ai/flows/generate-market-report-flow";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

type NewsArticle = GenerateNewsOutput["articles"][0];

const ROUND_DURATION_SECONDS = 300; // 5 minutes

const generateInitialData = () => {
    const data = [];
    const now = Date.now();
    let price = 65000 + (Math.random() - 0.5) * 2000;
    for (let i = 30; i > 0; i--) {
        price += (Math.random() - 0.5) * 100;
        data.push({ time: now - i * 2000, price: price });
    }
    return data;
};

export function DashboardClient() {
  const { toast } = useToast();
  const { isConnected, connectWallet } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState<"UP" | "DOWN" | null>(null);
  const [sentiment, setSentiment] = useState<AnalyzeCryptoSentimentOutput | null>(null);
  const [isLoadingSentiment, setIsLoadingSentiment] = useState(true);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_SECONDS);
  const [roundId, setRoundId] = useState(Math.floor(Date.now() / (ROUND_DURATION_SECONDS * 1000)));
  
  const [chartData, setChartData] = useState(generateInitialData());
  const lastPriceRef = useRef(chartData.length > 0 ? chartData[chartData.length - 1].price : 65000);

  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [marketReport, setMarketReport] = useState<GenerateMarketReportOutput | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);


  useEffect(() => {
    const dataInterval = setInterval(() => {
        const newPrice = lastPriceRef.current + (Math.random() - 0.5) * 500;
        lastPriceRef.current = newPrice;
        const newPoint = { time: Date.now(), price: newPrice };
        
        setChartData(prevData => {
            const newData = [...prevData, newPoint];
            return newData.slice(Math.max(newData.length - 30, 0));
        });
    }, 2000);

    const roundInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setRoundId(Math.floor(Date.now() / (ROUND_DURATION_SECONDS * 1000)));
          return ROUND_DURATION_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(roundInterval);
    };
  }, []);
  
  useEffect(() => {
    async function getSentimentAndNews() {
      setIsLoadingSentiment(true);
      try {
        const newsResult = await generateNews({ topic: "cryptocurrency" });
        setNews(newsResult.articles);
        const headlines = newsResult.articles.map(a => a.title).join(', ');

        const result = await analyzeCryptoSentiment({ newsHeadlines: headlines });
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
    getSentimentAndNews();
  }, [roundId, toast]);

  const handleGenerateReport = async () => {
    if (news.length === 0) {
      toast({
        variant: "destructive",
        title: "Berita belum tersedia",
        description: "Tunggu berita dimuat terlebih dahulu sebelum membuat laporan.",
      });
      return;
    }
    setIsGeneratingReport(true);
    setMarketReport(null);
    setIsReportDialogOpen(true);

    try {
      const headlines = news.map((a) => a.title).join(', ');
      const report = await generateMarketReport({ newsHeadlines: headlines });
      setMarketReport(report);
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        variant: "destructive",
        title: "Kesalahan AI",
        description: "Tidak dapat membuat laporan pasar.",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handlePredict = async (prediction: "UP" | "DOWN") => {
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Wallet Tidak Terhubung",
        description: "Silakan hubungkan wallet Anda untuk membuat prediksi.",
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
    <>
      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="font-heading text-2xl">Active Round #{roundId}</CardTitle>
                  <CardDescription>Predict the price of BTC/USD</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Round ends in</p>
                  <p className="text-2xl font-bold font-mono text-primary">{minutes}:{seconds}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-[2/1] bg-muted/30 rounded-lg p-4 my-4">
                  <ChartContainer
                      config={{
                          price: { label: "Price (USD)", color: "hsl(var(--primary))" },
                      }}
                  >
                      <LineChart
                          data={chartData}
                          margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                      >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis
                              dataKey="time"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          />
                          <YAxis
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              domain={['dataMin - 500', 'dataMax + 500']}
                              tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                          />
                          <ChartTooltip
                              cursor={true}
                              content={
                                  <ChartTooltipContent
                                      indicator="dot"
                                      formatter={(value) => `$${Number(value).toFixed(2)}`}
                                  />
                              }
                          />
                          <Line
                              type="monotone"
                              dataKey="price"
                              stroke="var(--color-price)"
                              strokeWidth={2}
                              dot={false}
                          />
                      </LineChart>
                  </ChartContainer>
              </div>
              
              {!isConnected && (
                <Card className="bg-accent/10 border-accent/50 text-center">
                  <CardContent className="p-6">
                    <Info className="mx-auto h-8 w-8 text-accent mb-2" />
                    <h3 className="font-bold">Hubungkan Wallet untuk Berpartisipasi</h3>
                    <p className="text-muted-foreground text-sm mb-4">Anda perlu menghubungkan wallet Anda sebelum dapat membuat prediksi.</p>
                    <Button onClick={connectWallet} variant="secondary">Hubungkan Wallet</Button>
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
            <Card className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="font-heading text-xl">Analisis Sentimen AI</CardTitle>
                <Link href="/news" className="text-sm text-primary hover:underline">
                   Lihat Berita &rarr;
                </Link>
              </CardHeader>
              <CardContent className="flex-grow">
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
                          Skor
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
              <CardFooter className="pt-4 mt-auto">
                  <Button onClick={handleGenerateReport} className="w-full" disabled={isGeneratingReport || isLoadingSentiment}>
                      <FileText className="mr-2 h-4 w-4" />
                      {isGeneratingReport ? "Membuat Laporan..." : "Buat Laporan AI Lengkap"}
                  </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-xl">Informasi Pool</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2 text-base">BTC/USD Pool</h4>
                  <div className="pl-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Hadiah</span>
                      <div className="text-right">
                        <span className="font-mono font-bold">1.52 BTC</span>
                        <span className="font-mono text-xs text-muted-foreground block">$100,000</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pool Atas</span>
                      <span className="font-mono text-green-400">0.80 BTC</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pool Bawah</span>
                      <span className="font-mono text-red-400">0.72 BTC</span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2 text-base">ETH/USD Pool</h4>
                  <div className="pl-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Hadiah</span>
                      <div className="text-right">
                        <span className="font-mono font-bold">25.5 ETH</span>
                        <span className="font-mono text-xs text-muted-foreground block">$90,000</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pool Atas</span>
                      <span className="font-mono text-green-400">15.0 ETH</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pool Bawah</span>
                      <span className="font-mono text-red-400">10.5 ETH</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Laporan Pasar AI</DialogTitle>
            <DialogDescription>
              Analisis terperinci berdasarkan berita utama terbaru.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 min-h-[24rem]">
            {isGeneratingReport && (
              <div className="flex flex-col items-center justify-center gap-4 text-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">AI sedang menganalisis pasar... ini mungkin memerlukan waktu sejenak.</p>
              </div>
            )}
            {marketReport && (
              <ScrollArea className="h-96 pr-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading text-lg font-semibold mb-2">Ringkasan Pasar</h3>
                    <p className="text-muted-foreground">{marketReport.summary}</p>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold mb-2">Tren Kunci Teridentifikasi</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      {marketReport.keyTrends.map((trend, index) => (
                        <li key={index}>{trend}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold mb-2">Tingkat Kepercayaan Analisis</h3>
                    <div className="flex items-center gap-4">
                      <Progress value={marketReport.confidence} className="w-full" />
                      <span className="font-mono font-bold">{marketReport.confidence}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Skor ini mewakili kepercayaan AI dalam analisisnya berdasarkan data yang diberikan.</p>
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsReportDialogOpen(false)} variant="outline">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
