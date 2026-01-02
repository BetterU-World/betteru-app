"use client";
import dynamic from "next/dynamic";

const AffiliateConnectPanel = dynamic(
  () => import("@/components/affiliate/AffiliateConnectPanel"),
  { ssr: false }
);

export default function AffiliateConnectClient() {
  return <AffiliateConnectPanel />;
}
