import { Suspense } from "react";
import Hub from "@/components/hub/Hub";

export default function HomePage() {
  return (
    <Suspense>
      <Hub />
    </Suspense>
  );
}