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

analyzerClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const detail = error.response?.data?.detail;
      if (detail) {
        return Promise.reject(new Error(String(detail)));
      }
      if (error.response) {
        return Promise.reject(
          new Error(`Request failed with status ${error.response.status}.`)
        );
      }
      return Promise.reject(
        new Error(
          "Unable to reach the backend. Please check your API configuration and ensure the server is running."
        )
      );
    }
    return Promise.reject(error);
  }
);

export async function analyzeUrl(url: string): Promise<AnalyzeResponse> {
  const response = await analyzerClient.post<AnalyzeResponse>("/analyze", {
    url,
  });

  return response.data;
}
