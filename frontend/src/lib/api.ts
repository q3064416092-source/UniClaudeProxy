/**
 * API client for UniClaudeProxy configuration management
 */

import type { AppConfig, ServiceStatus, ValidationResult } from "@/types/config"

const API_BASE = "/api"

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async getStatus(): Promise<ServiceStatus> {
    return this.request<ServiceStatus>("/status")
  }

  async getConfig(): Promise<AppConfig> {
    return this.request<AppConfig>("/config")
  }

  async updateConfig(config: AppConfig): Promise<{ message: string }> {
    return this.request<{ message: string }>("/config", {
      method: "PUT",
      body: JSON.stringify(config),
    })
  }

  async validateConfig(config: AppConfig): Promise<ValidationResult> {
    return this.request<ValidationResult>("/config/validate", {
      method: "POST",
      body: JSON.stringify(config),
    })
  }

  async exportConfig(): Promise<AppConfig> {
    return this.request<AppConfig>("/config/export")
  }

  async importConfig(config: AppConfig): Promise<{ message: string }> {
    return this.request<{ message: string }>("/config/import", {
      method: "POST",
      body: JSON.stringify(config),
    })
  }
}

export const api = new ApiClient()
