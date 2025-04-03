"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "./Loader";

export default function PageLoaderWrapper({ children }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500); // Simulate loading
    return () => clearTimeout(timeout);
  }, [pathname]);

  if (loading) return <Loader message="Loading page..." />;
  return children;
}
