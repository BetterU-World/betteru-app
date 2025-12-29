import { Suspense } from "react";
import HabitsClient from "./HabitsClient";

export default function HabitsPage() {
  return (
    <Suspense fallback={null}>
      <HabitsClient />
    </Suspense>
  );
}
