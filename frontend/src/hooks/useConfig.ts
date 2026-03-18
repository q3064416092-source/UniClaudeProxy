/**
 * Custom hook for configuration management
 */

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import type { AppConfig, ServiceStatus, ValidationResult } from "@/types/config"

export function useConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [status, setStatus] = useState<ServiceStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial config
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [configData, statusData] = await Promise.all([
        api.getConfig(),
        api.getStatus(),
      ])
      setConfig(configData)
      setStatus(statusData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load config")
      console.error("Failed to load config:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Update config
  const updateConfig = useCallback(async (newConfig: AppConfig) => {
    try {
      setError(null)
      await api.updateConfig(newConfig)
      setConfig(newConfig)
      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update config"
      setError(errorMsg)
      console.error("Failed to update config:", err)
      return false
    }
  }, [])

  // Validate config
  const validateConfig = useCallback(async (configToValidate: AppConfig) => {
    try {
      return await api.validateConfig(configToValidate)
    } catch (err) {
      console.error("Failed to validate config:", err)
      return {
        valid: false,
        errors: [err instanceof Error ? err.message : "Validation failed"],
        warnings: [],
      }
    }
  }, [])

  // Export config
  const exportConfig = useCallback(async () => {
    try {
      return await api.exportConfig()
    } catch (err) {
      console.error("Failed to export config:", err)
      return null
    }
  }, [])

  // Import config
  const importConfig = useCallback(async (configToImport: AppConfig) => {
    try {
      await api.importConfig(configToImport)
      setConfig(configToImport)
      return true
    } catch (err) {
      console.error("Failed to import config:", err)
      return false
    }
  }, [])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  return {
    config,
    status,
    loading,
    error,
    updateConfig,
    validateConfig,
    exportConfig,
    importConfig,
    reload: loadConfig,
  }
}
