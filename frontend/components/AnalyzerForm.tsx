import { FormEvent } from "react";

type AnalyzerFormProps = {
  url: string;
  isLoading: boolean;
  error: string | null;
  onUrlChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function AnalyzerForm({
  url,
  isLoading,
  error,
  onUrlChange,
  onSubmit,
}: AnalyzerFormProps) {
  return (
    <section className="card form-card">
      <form className="analyze-form" onSubmit={onSubmit}>
        <label htmlFor="url-input">Website URL</label>
        <div className="input-row">
          <input
            id="url-input"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="loading-wrap" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <p>Analyzing your URL. This may take a few seconds...</p>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
    </section>
  );
}
