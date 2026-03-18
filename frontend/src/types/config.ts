/**
 * TypeScript type definitions for UniClaudeProxy configuration
 * Matches the Python Pydantic models in app/config.py
 */

/** Reasoning configuration for extended thinking models */
export interface ReasoningConfig {
  effort?: "low" | "medium" | "high"
  summary?: "auto" | "concise" | "detailed"
}

/** Text generation parameters */
export interface TextConfig {
  verbosity?: "low" | "medium" | "high"
}

/** Image handling mode */
export type ImageMode = "input_image" | "save_and_ref" | "strip"

/** Truncation strategy */
export type TruncationMode = "auto" | "disabled"

export interface ModelConfig {
  name: string
  upstream_model_id?: string
  responses?: boolean
  use_react?: boolean
  inject_context?: boolean
  force_stream?: boolean
  upstream_system?: boolean
  tool_mapping?: Record<string, string>
  reasoning?: ReasoningConfig
  truncation?: TruncationMode
  text?: TextConfig
  max_output_tokens?: number
  parallel_tool_calls?: boolean
  image_mode?: ImageMode
  image_dir?: string
  system_replacements?: Record<string, string>
}

export interface ProviderConfig {
  provider_type: "openai" | "gemini" | "claude"
  api_key: string
  base_url: string
  headers?: Record<string, string>
  models: Record<string, ModelConfig>
}

export interface ServerConfig {
  host?: string
  port?: number
  local_only?: boolean
}

export interface AppConfig {
  server?: ServerConfig
  models: Record<string, string>
  providers: Record<string, ProviderConfig>
}

export interface ServiceStatus {
  status: string
  host: string
  port: number
  local_only: boolean
  providers_count: number
  models_count: number
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}
