"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Results page - Redirects to dashboard for backward compatibility
 * This page exists to handle legacy URLs that point to /results/[id]
 */
export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const datasetId = params.id as string;

  useEffect(() => {
    const storedData = sessionStorage.getItem(`analysis-${datasetId}`);
    if (!storedData) {
      router.push('/');
      return;
    }

    // Redirect to dashboard for backward compatibility
    router.replace(`/dashboard/${datasetId}`);
  }, [datasetId, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto" />
        <p className="mt-3 text-slate-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
