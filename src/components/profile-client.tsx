"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/use-wallet";
import type { Prediction } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, User, Wallet } from "lucide-react";

export function ProfileClient() {
  const { address, isConnected } = useWallet();
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPredictions = localStorage.getItem("userPredictions");
        if (savedPredictions) {
          setPredictions(JSON.parse(savedPredictions));
        }
      } catch (error) {
        console.error("Failed to load predictions from local storage", error);
      }
    }
  }, []);

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected";

  return (
    <div className="container py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">User Profile</CardTitle>
              <CardDescription>Your prediction history and wallet information.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <Wallet />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">Wallet Address</p>
              <p className="text-sm text-muted-foreground font-mono">{address || "Please connect your wallet"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Prediction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Round</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Prediction</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.length > 0 ? (
                predictions.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.round}</TableCell>
                    <TableCell>{p.asset}</TableCell>
                    <TableCell>
                      {p.prediction === "UP" ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <ArrowUp className="h-4 w-4" /> UP
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-400">
                          <ArrowDown className="h-4 w-4" /> DOWN
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                       <Badge variant={p.status === 'PENDING' ? 'secondary' : 'default'} className="capitalize">
                        {p.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(p.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No prediction history found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
