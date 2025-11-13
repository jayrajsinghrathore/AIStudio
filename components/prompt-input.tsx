"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, Wand2 } from "lucide-react"
import { useState } from "react"
import { StylePresets } from "./style-presets"

interface PromptInputProps {
  onEnhance: (enhancedPrompt: string) => void
  onGenerate: (prompt: string, stylePreset: string) => void
  isLoading: boolean
}

export function PromptInput({ onEnhance, onGenerate, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState("Luxurious lipstick advertisement with golden packaging and rose petals")
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [stylePreset, setStylePreset] = useState("photorealistic")
  const { toast } = useToast()

  const handleEnhance = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt first",
        variant: "destructive",
      })
      return
    }

    setIsEnhancing(true)
    try {
      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, stylePreset }),
      })

      if (!response.ok) {
        throw new Error("Failed to enhance prompt")
      }

      const data = await response.json()
      setEnhancedPrompt(data.enhancedPrompt)
      onEnhance(data.enhancedPrompt)
      toast({
        title: "Success",
        description: "Prompt enhanced with AI",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enhance prompt",
        variant: "destructive",
      })
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleGenerate = () => {
    const promptToUse = enhancedPrompt || prompt
    if (!promptToUse.trim()) {
      toast({
        title: "Error",
        description: "Please enter or enhance a prompt first",
        variant: "destructive",
      })
      return
    }

    onGenerate(promptToUse, stylePreset)
  }

  return (
    <div className="space-y-6 p-6 rounded-2xl bg-gradient-to-br from-white to-rose-50 border border-rose-100 shadow-lg">
      {/* Original Prompt */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">Your Prompt</label>
        <Textarea
          placeholder="Describe the beauty product ad you want to create..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading || isEnhancing}
          className="min-h-24 rounded-xl border-rose-200 bg-white focus:border-rose-400 focus:ring-rose-400 resize-none"
        />
      </div>

      {/* Style Presets */}
      <StylePresets selectedPreset={stylePreset} onSelectPreset={setStylePreset} />

      {/* Enhanced Prompt Display */}
      {enhancedPrompt && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">Enhanced Prompt</label>
          <div className="relative rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 p-4 text-sm text-gray-900 border border-rose-200">
            <Sparkles className="absolute top-3 right-3 w-4 h-4 text-rose-600" />
            <p className="pr-8">{enhancedPrompt}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleEnhance}
          disabled={isLoading || isEnhancing || !prompt.trim()}
          variant="outline"
          className="flex-1 border-rose-200 hover:bg-rose-50 text-rose-600 hover:text-rose-700 bg-transparent"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          {isEnhancing ? "Enhancing..." : "Enhance"}
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={isLoading || isEnhancing || !prompt.trim()}
          className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? "Generating..." : "Generate Image"}
        </Button>
      </div>
    </div>
  )
}
