/**
 * Server configuration component
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Server, Shield, AlertCircle } from "lucide-react"
import type { ServerConfig as ServerConfigType } from "@/types/config"

interface ServerConfigProps {
  config: ServerConfigType | undefined
  onUpdate: (config: ServerConfigType) => void
}

export function ServerConfig({ config, onUpdate }: ServerConfigProps) {
  const [localConfig, setLocalConfig] = useState<ServerConfigType>(
    config || {
      host: "127.0.0.1",
      port: 9223,
      local_only: true,
    }
  )

  const handleChange = (key: keyof ServerConfigType, value: string | number | boolean) => {
    const newConfig = { ...localConfig, [key]: value }
    setLocalConfig(newConfig)
  }

  const handleSave = () => {
    onUpdate(localConfig)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          <CardTitle>服务器配置</CardTitle>
        </div>
        <CardDescription>
          配置代理服务的监听地址和端口
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="host">监听地址</Label>
          <Input
            id="host"
            value={localConfig.host || "127.0.0.1"}
            onChange={(e) => handleChange("host", e.target.value)}
            placeholder="127.0.0.1"
          />
          <p className="text-sm text-muted-foreground">
            通常使用 127.0.0.1（仅本地访问）或 0.0.0.0（允许外部访问）
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="port">端口</Label>
          <Input
            id="port"
            type="number"
            value={localConfig.port || 9223}
            onChange={(e) => handleChange("port", parseInt(e.target.value))}
            placeholder="9223"
          />
          <p className="text-sm text-muted-foreground">
            代理服务的端口号，Claude Code 将连接到此端口
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5 flex items-start gap-3">
            <Shield className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <Label htmlFor="local_only" className="text-base font-medium">
                仅本地访问模式
              </Label>
              <p className="text-sm text-muted-foreground">
                启用后仅允许 localhost 连接，拒绝所有外部访问请求
              </p>
            </div>
          </div>
          <Switch
            id="local_only"
            checked={localConfig.local_only !== false}
            onCheckedChange={(checked) => handleChange("local_only", checked)}
          />
        </div>

        {!localConfig.local_only && (
          <div className="flex items-start gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-950 p-3 border border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">安全警告</p>
              <p className="text-yellow-700 dark:text-yellow-300">
                禁用本地访问模式将允许外部连接，可能存在安全风险。请确保在受信任的网络环境中使用。
              </p>
            </div>
          </div>
        )}

        <Button onClick={handleSave} className="w-full">
          保存配置
        </Button>
      </CardContent>
    </Card>
  )
}
