"use client"
import { useState } from "react"
import { X, ExternalLink, Download, FileText, ZoomIn, ZoomOut, RotateCw } from "lucide-react"

interface DocumentPreviewModalProps {
  url: string
  title?: string
  onClose: () => void
}

export default function DocumentPreviewModal({
  url,
  title = "Document Preview",
  onClose,
}: DocumentPreviewModalProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  if (!url) return null

  const isPdf = url.toLowerCase().includes(".pdf")
  const isDrive = url.includes("drive.google.com")
  const isImage =
    /\.(jpg|jpeg|png|webp|gif|svg|bmp|tiff)($|\?)/i.test(url) ||
    url.startsWith("data:image/") ||
    (!isPdf && !isDrive)

  let finalUrl = url
  if (url.includes("drive.google.com/drive/folders/")) {
    const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/)
    if (match && match[1]) {
      finalUrl = `https://drive.google.com/embeddedfolderview?id=${match[1]}#list`
    }
  } else if (url.includes("drive.google.com")) {
    finalUrl = url.replace("/view", "/preview")
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5))
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200/80 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-3">
            <div className="p-1.5 rounded-lg bg-[#003087]/10 text-[#003087] shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {title}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium truncate hidden sm:block">
                {isImage ? "Image Preview" : isPdf ? "PDF Document" : "Attached Document"}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isImage && (
              <div className="hidden sm:flex items-center gap-1 mr-2 bg-slate-200/60 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono font-bold text-slate-600 px-1">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  title="Rotate"
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              title="Open full size in new tab"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              title="Close preview"
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 bg-slate-900/90 overflow-auto relative flex items-center justify-center p-2 sm:p-4 min-h-0">
          {isImage ? (
            <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
              <img
                src={url}
                alt={title}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: "transform 0.15s ease-out",
                }}
                className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-lg shadow-2xl block mx-auto select-none"
              />
            </div>
          ) : (
            <iframe
              src={finalUrl}
              className="w-full h-full rounded-xl border-0 bg-white shadow-inner"
              title={title}
              allow="autoplay"
            />
          )}
        </div>
      </div>
    </div>
  )
}

