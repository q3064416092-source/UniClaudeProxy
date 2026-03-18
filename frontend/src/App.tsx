/**
 * Main configuration page for UniClaudeProxy
 */

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ServerConfig } from "@/components/ServerConfig/ServerConfig"
import { ProviderConfig } from "@/components/ProviderConfig/ProviderConfig"
import { ModelConfig } from "@/components/ModelConfig/ModelConfig"
import { Header } from "@/components/Header/Header"
import { useConfig } from "@/hooks/useConfig"
import { useToast } from "@/hooks/use-toast"
import { Server, Globe, Cpu, FileJson, AlertCircle } from "lucide-react"
import type { AppConfig } from "@/types/config"

function App() {
  const { config, status, loading, error, updateConfig, reload, importConfig, exportConfig } = useConfig()
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleServerUpdate = async (serverConfig: any) => {
    if (!config) return
    const newConfig = { ...config, server: serverConfig }
    await handleSave(newConfig)
  }

  const handleProvidersUpdate = async (providers: any) => {
    if (!config) return
    const newConfig = { ...config, providers }
    await handleSave(newConfig)
  }

  const handleConfigUpdate = async (newConfig: AppConfig) => {
    await handleSave(newConfig)
  }

  const handleSave = async (newConfig: AppConfig) => {
    setSaving(true)
    const success = await updateConfig(newConfig)
    setSaving(false)
    
    if (success) {
      toast({
        title: "保存成功",
        description: "配置已保存并自动重载",
      })
    } else {
      toast({
        variant: "error",
        title: "保存失败",
        description: "请检查配置是否正确",
      })
    }
  }

  const handleImport = async (configToImport: AppConfig) => {
    setSaving(true)
    const success = await importConfig(configToImport)
    setSaving(false)
    return success
  }

  const handleExport = async () => {
    return await exportConfig()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">加载配置中...</p>
        </div>
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">无法加载配置</h2>
            <p className="text-muted-foreground">{error || "未知错误"}</p>
          </div>
          <Button onClick={reload}>重新加载</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        status={status}
        config={config}
        onSave={() => handleSave(config)}
        onImport={handleImport}
        onExport={handleExport}
        saving={saving}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="server" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
            <TabsTrigger value="server" className="gap-2">
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">服务器</span>
            </TabsTrigger>
            <TabsTrigger value="providers" className="gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">提供商</span>
            </TabsTrigger>
            <TabsTrigger value="models" className="gap-2">
              <Cpu className="h-4 w-4" />
              <span className="hidden sm:inline">模型</span>
            </TabsTrigger>
            <TabsTrigger value="json" className="gap-2">
              <FileJson className="h-4 w-4" />
              <span className="hidden sm:inline">JSON</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="server">
            <ServerConfig config={config.server} onUpdate={handleServerUpdate} />
          </TabsContent>

          <TabsContent value="providers">
            <ProviderConfig providers={config.providers} onUpdate={handleProvidersUpdate} />
          </TabsContent>

          <TabsContent value="models">
            <ModelConfig config={config} onUpdate={handleConfigUpdate} />
          </TabsContent>

          <TabsContent value="json">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">配置预览</h2>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-[600px]">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
