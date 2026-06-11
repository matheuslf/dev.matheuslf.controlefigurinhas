import type { Metadata } from "next";
import { TradesClient } from "./trades-client";

export const metadata: Metadata = {
  title: "Pedidos de troca — Copa 2026",
  description: "Gerencie pedidos de troca de figurinhas.",
};

export default function TradesPage() {
  return <TradesClient />;
}
