export type FactualMetrics = {
  word_count: number;
  headings: {
    h1: number;
    h2: number;
    h3: number;
  };
  internal_links: number;
  external_links: number;
  total_images: number;
  alt_missing_percent: number;
  meta_title: string;
  meta_description: string;
  cta_count: number;
  raw_content: string;
};

export type AuditInsight = {
  category? : string;
  finding? : string;
  evidence? : string;
  impact? : string;
  severity? : string;
}

export type Recommendation = {
  priority? : string;
  action? : string;
  reasoning? : string;
  related_insight? : number;
}

export type AnalyzeResponse = {
  factual_metrics: FactualMetrics;
  ai_analysis: {
    insights: AuditInsight[];
    recommendations: Recommendation[];
  };
};
