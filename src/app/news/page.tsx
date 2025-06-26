"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Rss, Loader2, AlertTriangle } from "lucide-react";
import { generateNews, type GenerateNewsOutput } from "@/ai/flows/generate-news-flow";

type NewsArticle = GenerateNewsOutput["articles"][0];

export default function NewsPage() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchNews() {
            try {
                setIsLoading(true);
                setError(null);
                const result = await generateNews({ topic: "cryptocurrency" });
                const sortedArticles = result.articles.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setNews(sortedArticles);
            } catch (e) {
                console.error("Failed to fetch news:", e);
                setError("Gagal memuat berita. Silakan coba lagi nanti.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchNews();
    }, []);

    return (
        <div className="container py-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-full">
                    <Rss className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-headline font-bold">Umpan Berita Kripto Langsung</h1>
                    <p className="text-muted-foreground">Berita utama terbaru yang dihasilkan AI yang membentuk pasar.</p>
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="ml-4 text-muted-foreground">Memuat berita langsung...</p>
                </div>
            )}

            {error && (
                 <div className="flex flex-col items-center justify-center text-center text-destructive h-64">
                    <AlertTriangle className="w-12 h-12 mb-4" />
                    <p className="text-lg font-semibold">{error}</p>
                </div>
            )}
            
            {!isLoading && !error && (
                <div className="grid gap-6">
                    {news.map((item) => (
                        <Card key={item.id} className="hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    <CardTitle className="font-headline text-lg">{item.title}</CardTitle>
                                </a>
                                <CardDescription>
                                    {item.source} - {new Date(item.timestamp).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{item.summary}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
