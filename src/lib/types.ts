export type Prediction = {
  id: string;
  round: string;
  asset: string;
  prediction: "UP" | "DOWN";
  status: "PENDING" | "PROCESSED";
  timestamp: number;
};
