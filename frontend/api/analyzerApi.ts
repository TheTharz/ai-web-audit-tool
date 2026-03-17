import axios, { AxiosError } from "axios";

import { AnalyzeResponse } from "@/types/analyzer";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

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
  (error: AxiosError<{ detail?: string }>) => {
    const status = error.response?.status ?? 500;
    const detail = error.response?.data?.detail;
    const message =
      detail ??
      error.message ??
      "An unexpected error occurred. Please try again.";

    return Promise.reject(new ApiError(status, message));
  }
);

export async function analyzeUrl(url: string): Promise<AnalyzeResponse> {
  const response = await analyzerClient.post<AnalyzeResponse>("/analyze", {
    url,
  });

  return response.data;
}
