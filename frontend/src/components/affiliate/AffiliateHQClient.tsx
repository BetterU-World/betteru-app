"use client";

import dynamic from "next/dynamic";

const AffiliateHQ = dynamic(() => import("@/components/affiliate/AffiliateHQ"), {
  ssr: false,
});

export default function AffiliateHQClient() {
  return <AffiliateHQ />;
}
