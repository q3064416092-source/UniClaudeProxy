/**
 * Provider configuration component
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Edit2, Check, X, Key, Globe } from "lucide-react"
import type { ProviderConfig as ProviderConfigType } from "@/types/config"

interface ProviderConfigProps {
  providers: Record<string, ProviderConfigType>
  onUpdate: (providers: Record<string, ProviderConfigType>) => void
}

export function ProviderConfig({ providers, onUpdate }: ProviderConfigProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ProviderConfigType | null>(null)
  const [newProviderName, setNewProviderName] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProvider, setNewProvider] = useState<ProviderConfigType>({
    provider_type: "openai",
    api_key: "",
    base_url: "",
    headers: {},
    models: {},
  })

  const providerList = Object.entries(providers)

  const handleAddProvider = () => {
    if (!newProviderName.trim()) return

    onUpdate({
      ...providers,
      [newProviderName]: newProvider,
    })
    setNewProviderName("")
    setNewProvider({
      provider_type: "openai",
      api_key: "",
      base_url: "",
      headers: {},
      models: {},
    })
    setShowAddForm(false)
  }

  const handleEditProvider = (name: string) => {
    setEditingKey(name)
    setEditForm({ ...providers[name] })
  }

  const handleSaveEdit = (name: string) => {
    if (!editForm) return
    onUpdate({
      ...providers,
      [name]: editForm,
    })
    setEditingKey(null)
    setEditForm(null)
  }

  const handleCancelEdit = () => {
    setEditingKey(null)
    setEditForm(null)
  }

  const handleDeleteProvider = (name: string) => {
    const { [name]: removed, ...rest } = providers
    onUpdate(rest)
  }

  const parseHeaders = (headersStr: string): Record<string, string> => {
    try {
      return JSON.parse(headersStr)
    } catch {
      return {}
    }
  }

  const formatHeaders = (headers: Record<string, string>): string => {
    return JSON.stringify(headers, null, 2)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>提供商配置</CardTitle>
            <CardDescription>
              配置 LLM API 提供商（OpenAI、Gemini、Claude 等）
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            添加提供商
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
            <div className="space-y-2">
              <Label>提供商名称</Label>
              <Input
                value={newProviderName}
                onChange={(e) => setNewProviderName(e.target.value)}
                placeholder="例如: deepseek, gemini, ollama"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>提供商类型</Label>
                <select
                  value={newProvider.provider_type}
                  onChange={(e) => setNewProvider({ ...newProvider, provider_type: e.target.value as any })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                >
                  <option value="openai">OpenAI Compatible</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="claude">Anthropic Claude</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>模型数量</Label>
                <Input value={Object.keys(newProvider.models).length} disabled />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddProvider} className="flex-1">
                创建提供商
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                取消
              </Button>
            </div>
          </div>
        )}

        {providerList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无提供商配置，点击上方按钮添加
          </div>
        ) : (
          <div className="space-y-3">
            {providerList.map(([name, provider]) => (
              <div
                key={name}
                className="border rounded-lg p-4 space-y-3"
              >
                {editingKey === name ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{name}</div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSaveEdit(name)}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>提供商类型</Label>
                        <select
                          value={editForm?.provider_type}
                          onChange={(e) => setEditForm({ ...editForm!, provider_type: e.target.value as any })}
                          className="w-full h-10 rounded-md border border-input bg-background px-3"
                        >
                          <option value="openai">OpenAI Compatible</option>
                          <option value="gemini">Google Gemini</option>
                          <option value="claude">Anthropic Claude</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>模型数量</Label>
                        <Input value={Object.keys(provider.models).length} disabled />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <Label>API 密钥</Label>
                      </div>
                      <Input
                        type="password"
                        value={editForm?.api_key || ""}
                        onChange={(e) => setEditForm({ ...editForm!, api_key: e.target.value })}
                        placeholder="sk-..."
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <Label>API 端点</Label>
                      </div>
                      <Input
                        value={editForm?.base_url || ""}
                        onChange={(e) => setEditForm({ ...editForm!, base_url: e.target.value })}
                        placeholder="https://api.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>自定义请求头（JSON）</Label>
                      <Textarea
                        value={formatHeaders(editForm?.headers || {})}
                        onChange={(e) => setEditForm({ ...editForm!, headers: parseHeaders(e.target.value) })}
                        placeholder='{"Custom-Header": "value"}'
                        rows={3}
                        className="font-mono text-sm"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{name}</div>
                        <div className="text-sm text-muted-foreground">
                          {provider.provider_type.toUpperCase()} · {Object.keys(provider.models).length} 个模型
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditProvider(name)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteProvider(name)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      端点: {provider.base_url}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
