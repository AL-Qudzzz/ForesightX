"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Bot, Loader2, Send, User } from "lucide-react";
import { chatWithAdvisor } from "@/ai/flows/crypto-advisor-flow";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "model";
  content: string;
}

export function AdvisorClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
        // Use a timeout to ensure scroll happens after DOM update
        setTimeout(() => {
            scrollAreaRef.current?.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: "smooth"
            });
        }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages;
      const result = await chatWithAdvisor({ query: input, history });
      const modelMessage: Message = { role: "model", content: result.response };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error with AI Advisor:", error);
      toast({
        variant: "destructive",
        title: "Kesalahan AI",
        description: "Gagal mendapatkan respons dari penasihat. Silakan coba lagi.",
      });
       // remove the user message if AI fails
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8 flex justify-center">
      <Card className="w-full max-w-3xl h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div>
                <CardTitle className="font-headline text-2xl">Penasihat Kripto AI</CardTitle>
                <CardDescription>Tanyakan apa saja tentang pasar kripto. Saya di sini untuk membantu Anda menganalisis.</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              <AnimatePresence>
                {messages.map((message, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-start gap-4 ${
                            message.role === "user" ? "justify-end" : ""
                        }`}
                    >
                    {message.role === "model" && (
                      <Avatar className="w-8 h-8">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Bot className="h-5 w-5" />
                        </div>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-md rounded-xl px-4 py-3 text-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p style={{ whiteSpace: "pre-wrap" }}>{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="w-8 h-8">
                         <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                            <User className="h-5 w-5" />
                        </div>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-4"
                  >
                    <Avatar className="w-8 h-8">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                      </div>
                    </Avatar>
                    <div className="max-w-md rounded-xl px-4 py-3 bg-muted flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin"/>
                        <span>Berpikir...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4 border-t">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan tentang tren pasar..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Kirim</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
