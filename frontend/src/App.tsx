/**
 * Main configuration page for UniClaudeProxy
 */

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ServerConfig } from "@/components/ServerConfig/ServerConfig"
import { ProviderConfig } from "@/components/ProviderConfig/ProviderConfig"
import { ModelConfig } from "@/components/ModelConfig/ModelConfig"
import { useConfig } from "@/hooks/useConfig"
import { Settings, Server, Globe, Cpu, FileJson, Save, AlertCircle, CheckCircle2 } from "lucide-react"
import type { AppConfig } from "@/types/config"

function App() {
  const { config, loading, error, updateConfig, reload } = useConfig()
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

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
    setSaveMessage(null)
    const success = await updateConfig(newConfig)
    setSaving(false)
    
    if (success) {
      setSaveMessage({ type: "success", text: "配置已保存并自动重载" })
      setTimeout(() => setSaveMessage(null), 3000)
    } else {
      setSaveMessage({ type: "error", text: "保存失败，请检查配置" })
    }
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
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-semibold">UniClaudeProxy 配置</h1>
                <p className="text-sm text-muted-foreground">管理代理服务配置</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {saveMessage && (
                <div className={`flex items-center gap-2 text-sm ${
                  saveMessage.type === "success" ? "text-green-600" : "text-red-600"
                }`}>
                  {saveMessage.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {saveMessage.text}
                </div>
              )}
              <Button onClick={() => handleSave(config)} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? "保存中..." : "保存配置"}
              </Button>
            </div>
          </div>
        </div>
      </div>

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
