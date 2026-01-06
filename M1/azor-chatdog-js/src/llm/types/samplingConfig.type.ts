/**
 * Sampling configuration for LLM text generation
 */
export interface SamplingConfig {
  /**
   * Controls randomness in generation (0.0 - 2.0)
   * Lower values = more deterministic, higher values = more creative
   */
  temperature?: number;

  /**
   * Nucleus sampling - cumulative probability threshold (0.0 - 1.0)
   * Only tokens with cumulative probability <= topP are considered
   */
  topP?: number;

  /**
   * Top-K sampling - number of highest probability tokens to consider
   * Note: OpenAI API does not support this parameter
   */
  topK?: number;
}
