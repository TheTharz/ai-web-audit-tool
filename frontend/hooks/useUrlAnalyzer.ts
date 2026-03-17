import { FormEvent, useMemo, useState } from "react";

import { analyzeUrl, ApiError } from "@/api/analyzerApi";
import { AnalyzeResponse } from "@/types/analyzer";

type UseUrlAnalyzerState = {
  url: string;
  isLoading: boolean;
  error: string | null;
  result: AnalyzeResponse | null;
  hasResult: boolean;
  setUrl: (value: string) => void;
  handleAnalyze: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function useUrlAnalyzer(): UseUrlAnalyzerState {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const hasResult = useMemo(() => Boolean(result), [result]);

  async function handleAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!url.trim()) {
      setError("Please enter a valid URL.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const data = await analyzeUrl(url.trim());
      setResult(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "Unable to reach the server. Please check your connection and API configuration."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return {
    url,
    isLoading,
    error,
    result,
    hasResult,
    setUrl,
    handleAnalyze,
  };
}
