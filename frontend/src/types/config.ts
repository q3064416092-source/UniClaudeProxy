/**
 * TypeScript type definitions for UniClaudeProxy configuration
 * Matches the Python Pydantic models in app/config.py
 */

export interface ModelConfig {
  name: string
  upstream_model_id?: string
  responses?: boolean
  use_react?: boolean
  inject_context?: boolean
  force_stream?: boolean
  upstream_system?: boolean
  tool_mapping?: Record<string, string>
  reasoning?: Record<string, any>
  truncation?: string
  text?: Record<string, string>
  max_output_tokens?: number
  parallel_tool_calls?: boolean
  image_mode?: "input_image" | "save_and_ref" | "strip"
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
