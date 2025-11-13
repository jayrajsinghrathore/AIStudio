"use client"

import { Header } from "@/components/header"
import { PromptInput } from "@/components/prompt-input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Download, Trash2, Eye } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

interface Generation {
  id: string
  imageUrl: string
  enhancedPrompt: string
  originalPrompt: string
  stylePreset?: string
  createdAt: string
}

export default function StudioPage() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [selectedImage, setSelectedImage] = useState<Generation | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleGenerate = async (enhancedPrompt: string, stylePreset: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          enhancedPrompt,
          stylePreset,
          numVariations: 1,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate image")
      }

      const data = await response.json()
      const newGeneration: Generation = {
        id: data.generationId,
        imageUrl: data.imageUrls?.[0] || "/placeholder.svg",
        enhancedPrompt,
        originalPrompt: enhancedPrompt,
        stylePreset,
        createdAt: new Date().toISOString(),
      }

      setGenerations((prev) => [newGeneration, ...prev])
      toast({
        title: "Success",
        description: "Image generated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate image",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `beauty-ad-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast({
        title: "Success",
        description: "Image downloaded",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive",
      })
    }
  }

  const handleDelete = (id: string) => {
    setGenerations((prev) => prev.filter((gen) => gen.id !== id))
    toast({
      title: "Success",
      description: "Image deleted",
    })
  }

  if (!isClient) return null

  return (
    <div className="min-h-svh bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <Header />
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Panel - Editor */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  Create Your Ad
                </h2>
                <PromptInput onEnhance={() => {}} onGenerate={handleGenerate} isLoading={isLoading} />
              </div>
            </div>
          </div>

          {/* Right Panel - Gallery */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Generated Images</h2>
            {generations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-white to-rose-50 rounded-2xl border-2 border-dashed border-rose-200">
                <div className="text-center space-y-3">
                  <div className="text-4xl">✨</div>
                  <p className="text-lg font-medium text-gray-900">No images yet</p>
                  <p className="text-sm text-gray-600 max-w-xs">
                    Create your first beauty ad image using the editor on the left
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generations.map((gen) => (
                  <div
                    key={gen.id}
                    className="group relative overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-rose-100 to-pink-100">
                      <Image
                        src={gen.imageUrl || "/placeholder.svg"}
                        alt="Generated ad"
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedImage(gen)}
                          className="bg-white/90 hover:bg-white text-gray-900"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(gen.imageUrl, gen.enhancedPrompt)}
                          className="bg-white/90 hover:bg-white text-gray-900"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(gen.id)}
                          className="bg-red-500/90 hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Info Footer */}
                    <div className="p-3 bg-white space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {gen.stylePreset && (
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 rounded-full">
                            {gen.stylePreset}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{new Date(gen.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">{gen.enhancedPrompt}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fullscreen Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              ✕
            </button>
            <Image
              src={selectedImage.imageUrl || "/placeholder.svg"}
              alt="Fullscreen view"
              width={1024}
              height={1024}
              className="w-full h-auto rounded-xl"
            />
            <div className="mt-4 p-4 bg-white/10 backdrop-blur rounded-xl text-white">
              <p className="text-sm">{selectedImage.enhancedPrompt}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
