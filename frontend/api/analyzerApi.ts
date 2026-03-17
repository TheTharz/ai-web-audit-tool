import axios from "axios";

import { AnalyzeResponse } from "@/types/analyzer";

const apiBaseUrl = process.env.NEXT_PUBLIC_ANALYZER_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_ANALYZER_API_BASE_URL. Add it to your .env file."
  );
}

const analyzerClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function analyzeUrl(url: string): Promise<AnalyzeResponse> {
  const response = await analyzerClient.post<AnalyzeResponse>("/analyze", {
    url,
  });

  return response.data;
}
