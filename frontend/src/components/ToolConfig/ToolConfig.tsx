/**
 * Tool calling configuration component
 * Detailed configuration for ReAct, tool mapping, system replacements, etc.
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Wrench, Zap, MessageSquare, Plus, Trash2, Info, Brain, FileText, Scissors, Image, Settings2 } from "lucide-react"
import type { ModelConfig, ReasoningConfig, TextConfig, ImageMode, TruncationMode } from "@/types/config"

interface ToolConfigProps {
  modelConfig: ModelConfig
  onUpdate: (config: ModelConfig) => void
}

export function ToolConfig({ modelConfig, onUpdate }: ToolConfigProps) {
  const [showHelp, setShowHelp] = useState<Record<string, boolean>>({})

  const toggleHelp = (key: string) => {
    setShowHelp(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleToggle = (key: keyof ModelConfig, value: boolean) => {
    onUpdate({ ...modelConfig, [key]: value })
  }

  const handleReasoningUpdate = (key: keyof ReasoningConfig, value: string) => {
    const reasoning = { ...(modelConfig.reasoning || {}) }
    if (value) {
      reasoning[key] = value as any
    } else {
      delete reasoning[key]
    }
    onUpdate({ ...modelConfig, reasoning })
  }

  const handleTextUpdate = (key: keyof TextConfig, value: string) => {
    const text = { ...(modelConfig.text || {}) }
    if (value) {
      text[key] = value as any
    } else {
      delete text[key]
    }
    onUpdate({ ...modelConfig, text })
  }

  const handleSelect = (key: keyof ModelConfig, value: string | undefined) => {
    onUpdate({ ...modelConfig, [key]: value || undefined })
  }

  const handleMappingAdd = (type: "tool_mapping" | "system_replacements") => {
    const newMapping = { ...(modelConfig[type] || {}) }
    const key = type === "tool_mapping" ? "new_tool" : "original text"
    const value = type === "tool_mapping" ? "NewToolName" : "replacement text"
    newMapping[key] = value
    onUpdate({ ...modelConfig, [type]: newMapping })
  }

  const handleMappingUpdate = (
    type: "tool_mapping" | "system_replacements",
    oldKey: string,
    newKey: string,
    value: string
  ) => {
    const newMapping = { ...(modelConfig[type] || {}) }
    if (oldKey !== newKey) {
      delete newMapping[oldKey]
    }
    newMapping[newKey] = value
    onUpdate({ ...modelConfig, [type]: newMapping })
  }

  const handleMappingDelete = (type: "tool_mapping" | "system_replacements", key: string) => {
    const newMapping = { ...(modelConfig[type] || {}) }
    delete newMapping[key]
    onUpdate({ ...modelConfig, [type]: newMapping })
  }

  return (
    <div className="space-y-4">
      {/* ReAct Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">ReAct XML 工具调用</CardTitle>
            </div>
            <Button size="sm" variant="ghost" onClick={() => toggleHelp("react")}>
              <Info className="h-4 w-4" />
            </Button>
          </div>
          {showHelp.react && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg mt-2">
              <p className="font-medium mb-1">适用场景：</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>不支持原生 function calling 的模型（如本地 Ollama）</li>
                <li>将工具描述注入系统提示词，模型用 XML 格式输出</li>
                <li>自动解析并转换为 Anthropic 工具调用格式</li>
              </ul>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">启用 ReAct 模式</Label>
              <p className="text-sm text-muted-foreground">为此模型启用 XML 格式的工具调用</p>
            </div>
            <Switch
              checked={modelConfig.use_react || false}
              onCheckedChange={(checked) => handleToggle("use_react", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tool Name Mapping */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">工具名称映射</CardTitle>
            </div>
            <Button size="sm" variant="ghost" onClick={() => toggleHelp("tool")}>
              <Info className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>将上游工具名称映射到 Claude Code 的工具名称</CardDescription>
          {showHelp.tool && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg mt-2">
              <p className="font-medium mb-1">示例：</p>
              <code className="text-xs">shell_call → Bash</code>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(modelConfig.tool_mapping || {}).map(([upstream, claude]) => (
            <div key={upstream} className="flex items-center gap-2">
              <Input
                value={upstream}
                onChange={(e) => handleMappingUpdate("tool_mapping", upstream, e.target.value, claude as string)}
                placeholder="上游工具名称"
                className="flex-1"
              />
              <span className="text-muted-foreground">→</span>
              <Input
                value={claude as string}
                onChange={(e) => handleMappingUpdate("tool_mapping", upstream, upstream, e.target.value)}
                placeholder="Claude 工具名称"
                className="flex-1"
              />
              <Button size="sm" variant="ghost" onClick={() => handleMappingDelete("tool_mapping", upstream)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          <Button onClick={() => handleMappingAdd("tool_mapping")} size="sm" className="w-full gap-1">
            <Plus className="h-4 w-4" />添加工具映射
          </Button>
        </CardContent>
      </Card>

      {/* System Prompt Replacements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">系统提示词替换</CardTitle>
            </div>
            <Button size="sm" variant="ghost" onClick={() => toggleHelp("system")}>
              <Info className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>替换系统提示词中的身份识别字符串</CardDescription>
          {showHelp.system && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg mt-2">
              <p className="font-medium mb-1">常见替换：</p>
              <code className="text-xs">"You are Claude Code" → "You are an AI assistant"</code>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(modelConfig.system_replacements || {}).map(([target, replacement]) => (
            <div key={target} className="space-y-2 border rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground w-16">原文本：</Label>
                <Input
                  value={target}
                  onChange={(e) => handleMappingUpdate("system_replacements", target, e.target.value, replacement as string)}
                  className="flex-1 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground w-16">替换为：</Label>
                <Input
                  value={replacement as string}
                  onChange={(e) => handleMappingUpdate("system_replacements", target, target, e.target.value)}
                  className="flex-1 text-sm"
                />
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleMappingDelete("system_replacements", target)} className="w-full text-red-500">
                <Trash2 className="h-4 w-4 mr-1" />删除此替换
              </Button>
            </div>
          ))}
          <Button onClick={() => handleMappingAdd("system_replacements")} size="sm" className="w-full gap-1">
            <Plus className="h-4 w-4" />添加系统提示词替换
          </Button>
        </CardContent>
      </Card>

      {/* Reasoning Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">推理参数配置</CardTitle>
          </div>
          <CardDescription>扩展思考模型的推理参数（仅限支持 extended thinking 的模型）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>推理力度 (effort)</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={modelConfig.reasoning?.effort || ""}
              onChange={(e) => handleReasoningUpdate("effort", e.target.value)}
            >
              <option value="">不设置</option>
              <option value="low">低 - 快速响应</option>
              <option value="medium">中 - 平衡模式</option>
              <option value="high">高 - 深度思考</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>思考摘要模式 (summary)</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={modelConfig.reasoning?.summary || ""}
              onChange={(e) => handleReasoningUpdate("summary", e.target.value)}
            >
              <option value="">不设置</option>
              <option value="auto">自动</option>
              <option value="concise">简洁</option>
              <option value="detailed">详细</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Text & Truncation Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">文本与截断配置</CardTitle>
          </div>
          <CardDescription>文本生成参数和上下文截断策略</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>文本冗长度 (verbosity)</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={modelConfig.text?.verbosity || ""}
              onChange={(e) => handleTextUpdate("verbosity", e.target.value)}
            >
              <option value="">不设置</option>
              <option value="low">低 - 简洁回复</option>
              <option value="medium">中 - 平衡</option>
              <option value="high">高 - 详细回复</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>截断策略 (truncation)</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={modelConfig.truncation || ""}
              onChange={(e) => handleSelect("truncation", e.target.value || undefined)}
            >
              <option value="">不设置</option>
              <option value="auto">自动截断</option>
              <option value="disabled">禁用截断</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Image Processing Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">图片处理配置</CardTitle>
          </div>
          <CardDescription>图片消息的处理方式</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>图片模式 (image_mode)</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={modelConfig.image_mode || ""}
              onChange={(e) => handleSelect("image_mode", e.target.value || undefined)}
            >
              <option value="">不设置（默认 input_image）</option>
              <option value="input_image">input_image - 直接传递图片</option>
              <option value="save_and_ref">save_and_ref - 保存并引用</option>
              <option value="strip">strip - 移除图片</option>
            </select>
          </div>
          {modelConfig.image_mode === "save_and_ref" && (
            <div className="space-y-2">
              <Label>图片保存目录 (image_dir)</Label>
              <Input
                value={modelConfig.image_dir || ""}
                onChange={(e) => onUpdate({ ...modelConfig, image_dir: e.target.value || undefined })}
                placeholder="例如: ./images"
              />
              <p className="text-xs text-muted-foreground">指定图片保存的本地目录路径</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">高级设置</CardTitle>
          </div>
          <CardDescription>并行工具调用、上下文注入等高级选项</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "responses", label: "启用 Responses", desc: "启用 Responses API 支持" },
            { key: "parallel_tool_calls", label: "并行工具调用", desc: "允许模型在单次响应中调用多个工具" },
            { key: "inject_context", label: "注入上下文", desc: "将系统提示词和工具摘要注入到开发者消息中" },
            { key: "upstream_system", label: "使用上游系统提示", desc: "使用提供商强制的系统提示词和工具配置" },
            { key: "force_stream", label: "强制流式响应", desc: "提供商始终返回 SSE，内部处理非流式请求" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="font-medium">{label}</Label>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
              <Switch
                checked={(modelConfig as any)[key] || false}
                onCheckedChange={(checked) => handleToggle(key as any, checked)}
              />
            </div>
          ))}
          <div className="space-y-2">
            <Label>最大输出 Token (max_output_tokens)</Label>
            <Input
              type="number"
              value={modelConfig.max_output_tokens || ""}
              onChange={(e) => onUpdate({ ...modelConfig, max_output_tokens: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="例如: 4096"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
