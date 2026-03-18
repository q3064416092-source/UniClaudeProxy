/**
 * Model configuration component
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Plus, Trash2, Edit2, Settings2 } from "lucide-react"
import type { AppConfig, ModelConfig as ModelConfigType } from "@/types/config"
import { ToolConfig } from "../ToolConfig/ToolConfig"

interface ModelConfigProps {
  config: AppConfig
  onUpdate: (config: AppConfig) => void
}

export function ModelConfig({ config, onUpdate }: ModelConfigProps) {
  const [editingMapping, setEditingMapping] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [showAddMapping, setShowAddMapping] = useState(false)
  const [newClaudeModel, setNewClaudeModel] = useState("")
  const [newProviderModel, setNewProviderModel] = useState("")

  const modelMappings = Object.entries(config.models)

  const handleAddMapping = () => {
    if (!newClaudeModel.trim() || !newProviderModel.trim()) return

    onUpdate({
      ...config,
      models: {
        ...config.models,
        [newClaudeModel]: newProviderModel,
      },
    })
    setNewClaudeModel("")
    setNewProviderModel("")
    setShowAddMapping(false)
  }

  const handleEditMapping = (claudeModel: string) => {
    setEditingMapping(claudeModel)
    setEditValue(config.models[claudeModel])
  }

  const handleSaveMapping = (claudeModel: string) => {
    onUpdate({
      ...config,
      models: {
        ...config.models,
        [claudeModel]: editValue,
      },
    })
    setEditingMapping(null)
    setEditValue("")
  }

  const handleDeleteMapping = (claudeModel: string) => {
    const { [claudeModel]: removed, ...rest } = config.models
    onUpdate({
      ...config,
      models: rest,
    })
  }

  const handleModelConfigUpdate = (providerName: string, modelId: string, modelConfig: ModelConfigType) => {
    onUpdate({
      ...config,
      providers: {
        ...config.providers,
        [providerName]: {
          ...config.providers[providerName],
          models: {
            ...config.providers[providerName].models,
            [modelId]: modelConfig,
          },
        },
      },
    })
  }

  const parseProviderModel = (mapping: string) => {
    const parts = mapping.split("/", 1)
    if (parts.length !== 2) return null
    return { providerName: parts[0], modelId: parts[1] }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>模型映射</CardTitle>
              <CardDescription>
                将 Claude 模型名称映射到提供商的模型 ID
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddMapping(!showAddMapping)}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              添加映射
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddMapping && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Claude 模型名称</Label>
                  <Input
                    value={newClaudeModel}
                    onChange={(e) => setNewClaudeModel(e.target.value)}
                    placeholder="claude-sonnet-4-5-20250929"
                  />
                </div>
                <div className="space-y-2">
                  <Label>提供商模型（格式: provider/model-id）</Label>
                  <Input
                    value={newProviderModel}
                    onChange={(e) => setNewProviderModel(e.target.value)}
                    placeholder="deepseek/deepseek-chat"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddMapping} className="flex-1">
                  添加映射
                </Button>
                <Button variant="outline" onClick={() => setShowAddMapping(false)}>
                  取消
                </Button>
              </div>
            </div>
          )}

          {modelMappings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无模型映射配置
            </div>
          ) : (
            <div className="space-y-2">
              {modelMappings.map(([claudeModel, providerModel]) => (
                <div
                  key={claudeModel}
                  className="flex items-center gap-2 border rounded-lg p-3"
                >
                  {editingMapping === claudeModel ? (
                    <>
                      <Input
                        value={claudeModel}
                        disabled
                        className="flex-1"
                      />
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveMapping(claudeModel)}
                      >
                        保存
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingMapping(null)}
                      >
                        取消
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="font-medium">{claudeModel}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{providerModel}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditMapping(claudeModel)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMapping(claudeModel)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <CardTitle>模型详细配置</CardTitle>
          </div>
          <CardDescription>
            配置每个模型的详细参数，包括工具调用、推理参数等
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={modelMappings[0]?.[0]} className="w-full">
            <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
              {modelMappings.map(([claudeModel, providerModel]) => {
                const parsed = parseProviderModel(providerModel)
                if (!parsed) return null
                const modelConfig = config.providers[parsed.providerName]?.models[parsed.modelId]
                return (
                  <TabsTrigger key={claudeModel} value={claudeModel} className="text-xs">
                    {modelConfig?.name || claudeModel}
                  </TabsTrigger>
                )
              })}
            </TabsList>
            {modelMappings.map(([claudeModel, providerModel]) => {
              const parsed = parseProviderModel(providerModel)
              if (!parsed) return null
              const modelConfig = config.providers[parsed.providerName]?.models[parsed.modelId] || {
                name: parsed.modelId,
              }
              const provider = config.providers[parsed.providerName]

              return (
                <TabsContent key={claudeModel} value={claudeModel} className="mt-4">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>显示名称</Label>
                        <Input
                          value={modelConfig.name}
                          onChange={(e) =>
                            handleModelConfigUpdate(parsed.providerName, parsed.modelId, {
                              ...modelConfig,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>上游模型 ID</Label>
                        <Input
                          value={modelConfig.upstream_model_id || ""}
                          onChange={(e) =>
                            handleModelConfigUpdate(parsed.providerName, parsed.modelId, {
                              ...modelConfig,
                              upstream_model_id: e.target.value || undefined,
                            })
                          }
                          placeholder="留空使用默认"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>最大输出 Token</Label>
                        <Input
                          type="number"
                          value={modelConfig.max_output_tokens || ""}
                          onChange={(e) =>
                            handleModelConfigUpdate(parsed.providerName, parsed.modelId, {
                              ...modelConfig,
                              max_output_tokens: parseInt(e.target.value) || undefined,
                            })
                          }
                          placeholder="8192"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>图片处理模式</Label>
                        <select
                          value={modelConfig.image_mode || "input_image"}
                          onChange={(e) =>
                            handleModelConfigUpdate(parsed.providerName, parsed.modelId, {
                              ...modelConfig,
                              image_mode: e.target.value as any,
                            })
                          }
                          className="w-full h-10 rounded-md border border-input bg-background px-3"
                        >
                          <option value="input_image">内联 Base64</option>
                          <option value="save_and_ref">保存并引用</option>
                          <option value="strip">移除图片</option>
                        </select>
                      </div>
                    </div>

                    <ToolConfig
                      modelConfig={modelConfig}
                      onUpdate={(updated) =>
                        handleModelConfigUpdate(parsed.providerName, parsed.modelId, updated)
                      }
                    />
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
