/**
 * Header component with service status and import/export controls
 */

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Settings, Save, Download, Upload, Server, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import type { ServiceStatus, AppConfig } from "@/types/config"
import { useToast } from "@/hooks/use-toast"

interface HeaderProps {
  status: ServiceStatus | null
  config: AppConfig
  onSave: () => Promise<void>
  onImport: (config: AppConfig) => Promise<boolean>
  onExport: () => Promise<AppConfig | null>
  saving: boolean
}

export function Header({ status, config, onSave, onImport, onExport, saving }: HeaderProps) {
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleExport = async () => {
    setExporting(true)
    try {
      const exportedConfig = await onExport()
      if (exportedConfig) {
        const blob = new Blob([JSON.stringify(exportedConfig, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `uniclaudeproxy-config-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast({
          title: "导出成功",
          description: "配置文件已下载",
        })
      } else {
        toast({
          variant: "error",
          title: "导出失败",
          description: "无法导出配置",
        })
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "导出失败",
        description: error instanceof Error ? error.message : "未知错误",
      })
    } finally {
      setExporting(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const text = await file.text()
      const importedConfig = JSON.parse(text) as AppConfig
      
      const success = await onImport(importedConfig)
      if (success) {
        toast({
          title: "导入成功",
          description: "配置已导入并保存",
        })
      } else {
        toast({
          variant: "error",
          title: "导入失败",
          description: "无法保存导入的配置",
        })
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "导入失败",
        description: error instanceof Error ? error.message : "无效的配置文件格式",
      })
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="border-b bg-card sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">UniClaudeProxy 配置</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {status ? (
                  <>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      运行中
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Server className="h-3 w-3" />
                      {status.host}:{status.port}
                    </span>
                    <span>·</span>
                    <span>{status.providers_count} 提供商 · {status.models_count} 模型</span>
                  </>
                ) : (
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-red-500" />
                    无法获取状态
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportClick}
              disabled={importing || saving}
              className="gap-2"
            >
              {importing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">导入</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exporting || saving}
              className="gap-2"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">导出</span>
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={saving || importing || exporting}
              className="gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">保存</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
