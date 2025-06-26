import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Rss } from "lucide-react";

const mockNews = [
    {
        id: 1,
        title: "Bitcoin Mencapai Puncak Baru di Tengah Minat Institusional",
        source: "CryptoNews Harian",
        timestamp: "2024-10-26T10:00:00Z",
        summary: "Harga Bitcoin melonjak hingga lebih dari $80.000, didorong oleh pengumuman pembelian besar dari investor institusional dan berita regulasi positif dari AS.",
        url: "#"
    },
    {
        id: 2,
        title: "Penggabungan Ethereum Berhasil, Harga ETH Stabil",
        source: "Blockchain Mingguan",
        timestamp: "2024-10-25T15:30:00Z",
        summary: "Pembaruan 'The Merge' Ethereum telah berhasil diselesaikan, memindahkan jaringan ke Proof-of-Stake dan mengurangi konsumsi energi secara signifikan. Harga ETH menunjukkan stabilitas pasca-pembaruan.",
        url: "#"
    },
    {
        id: 3,
        title: "Jaringan Solana Mengalami Gangguan Lagi, Komunitas Prihatin",
        source: "DeFi Times",
        timestamp: "2024-10-25T09:00:00Z",
        summary: "Jaringan Solana mengalami gangguan selama beberapa jam, yang terbaru dari serangkaian masalah teknis. Hal ini menimbulkan kekhawatiran tentang keandalan jaringan.",
        url: "#"
    },
    {
        id: 4,
        title: "Harga Dogecoin Melonjak Setelah Cuitan Selebriti",
        source: "MemeCoin Monitor",
        timestamp: "2024-10-24T18:45:00Z",
        summary: "Sebuah cuitan dari seorang selebriti terkenal menyebabkan lonjakan harga Dogecoin sebesar 25% dalam beberapa jam, menunjukkan volatilitas pasar koin meme.",
        url: "#"
    },
    {
        id: 5,
        title: "SEC Mengumumkan Regulasi Kripto Baru",
        source: "Regulator Watch",
        timestamp: "2024-10-24T11:20:00Z",
        summary: "Komisi Sekuritas dan Bursa AS (SEC) telah mengumumkan kerangka kerja peraturan baru untuk bursa kripto, yang bertujuan untuk meningkatkan perlindungan investor.",
        url: "#"
    }
];

export default function NewsPage() {
    return (
        <div className="container py-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-full">
                    <Rss className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-headline font-bold">Umpan Berita Kripto</h1>
                    <p className="text-muted-foreground">Berita utama terbaru yang membentuk pasar.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {mockNews.map((item) => (
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
        </div>
    );
}
