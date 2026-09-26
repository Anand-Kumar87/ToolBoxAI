"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Loader2,
  Download,
  UploadCloud,
  ImageIcon,
  RefreshCcw,
  Eraser,
  Crop,
  Undo2,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  Sliders,
  Paintbrush,
  Droplet,
  Grid3X3,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ToolDefinition } from "@/types";
import { ImageToolConfig } from "@/config/image-tools";
import { processImageAction } from "@/actions/image";
import { recordClientToolUsageAction } from "@/actions/usage";
import { optimizeImageForUpload } from "@/lib/image-optimizer-client";

interface ImageToolClientProps {
  tool: ToolDefinition;
  config: ImageToolConfig;
}

interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageToolClient({ tool, config }: ImageToolClientProps) {
  const isWatermarkRemover = tool.slug === "watermark-remover";

  const [formData, setFormData] = React.useState<Record<string, string>>({});
  const [file, setFile] = React.useState<File | null>(null);
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [resultBase64, setResultBase64] = React.useState<string | null>(null);

  // Watermark interactive studio state
  const [selectionType, setSelectionType] = React.useState<"box" | "brush">("box");
  const [brushSize, setBrushSize] = React.useState<number>(24);
  const [activeAction, setActiveAction] = React.useState<"inpaint" | "blur" | "pixelate">("inpaint");
  const [intensity, setIntensity] = React.useState<number>(80);
  const [selectionBox, setSelectionBox] = React.useState<SelectionBox | null>(null);
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number } | null>(null);
  const [historyStack, setHistoryStack] = React.useState<string[]>([]);
  const [originalSrc, setOriginalSrc] = React.useState<string | null>(null);
  const [isViewingOriginal, setIsViewingOriginal] = React.useState(false);

  const mainCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Initialize generic form defaults
  React.useEffect(() => {
    const initial: Record<string, string> = {};
    config.fields.forEach((f) => {
      if (f.defaultValue !== undefined) {
        initial[f.name] = String(f.defaultValue);
      } else if (f.type === "select" && f.options?.length) {
        initial[f.name] = f.options[0];
      } else {
        initial[f.name] = "";
      }
    });
    setFormData(initial);
  }, [config.fields]);

  // Clean up object URLs
  React.useEffect(() => {
    return () => {
      if (imageSrc && imageSrc.startsWith("blob:")) URL.revokeObjectURL(imageSrc);
      if (originalSrc && originalSrc.startsWith("blob:")) URL.revokeObjectURL(originalSrc);
    };
  }, [imageSrc, originalSrc]);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        return;
      }

      // Auto-optimize camera photos on mobile to prevent memory lag
      let processedFile = selected;
      if (selected.size > 2.5 * 1024 * 1024) {
        try {
          processedFile = await optimizeImageForUpload(selected, 2048, 0.9);
        } catch {
          processedFile = selected;
        }
      }

      setFile(processedFile);
      const url = URL.createObjectURL(processedFile);
      setImageSrc(url);
      setOriginalSrc(url);
      setResultBase64(null);
      setHistoryStack([]);
      setSelectionBox(null);
      toast.success(`Loaded image: ${selected.name}`);
    }
  };

  // Load and draw image onto main canvas for interactive watermark remover
  React.useEffect(() => {
    if (!isWatermarkRemover || !imageSrc) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const mainCanvas = mainCanvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      if (!mainCanvas || !overlayCanvas) return;

      // Restrict working canvas max dimension to 1920 to prevent 400MB RAM crash on mobile browsers
      const MAX_CANVAS = 1920;
      let w = img.naturalWidth || 800;
      let h = img.naturalHeight || 600;
      if (w > MAX_CANVAS || h > MAX_CANVAS) {
        if (w > h) {
          h = Math.round((h * MAX_CANVAS) / w);
          w = MAX_CANVAS;
        } else {
          w = Math.round((w * MAX_CANVAS) / h);
          h = MAX_CANVAS;
        }
      }

      mainCanvas.width = w;
      mainCanvas.height = h;
      overlayCanvas.width = w;
      overlayCanvas.height = h;

      const ctx = mainCanvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        setResultBase64(mainCanvas.toDataURL("image/jpeg", 0.92));
      }

      const oCtx = overlayCanvas.getContext("2d");
      if (oCtx) {
        oCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      }
    };
  }, [imageSrc, isWatermarkRemover]);

  // Redraw selection on overlay canvas
  const drawOverlaySelection = React.useCallback(
    (box: SelectionBox | null) => {
      const overlayCanvas = overlayCanvasRef.current;
      if (!overlayCanvas) return;
      const ctx = overlayCanvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

      if (!box || box.width <= 0 || box.height <= 0) return;

      // Draw tinted mask
      ctx.fillStyle = "rgba(239, 68, 68, 0.28)";
      ctx.fillRect(box.x, box.y, box.width, box.height);

      // Draw dashed border
      ctx.lineWidth = Math.max(2, Math.round(overlayCanvas.width / 500));
      ctx.strokeStyle = "#ef4444";
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      ctx.setLineDash([]);

      // Draw dimension tag badge
      const tagText = `${Math.round(box.width)} × ${Math.round(box.height)}px`;
      const fontSize = Math.max(12, Math.round(overlayCanvas.width / 70));
      ctx.font = `bold ${fontSize}px sans-serif`;
      const tagW = ctx.measureText(tagText).width + 12;
      const tagH = fontSize + 8;
      const tagY = box.y > tagH + 5 ? box.y - tagH - 4 : box.y + 4;

      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillRect(box.x, tagY, tagW, tagH);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(tagText, box.x + 6, tagY + fontSize);
    },
    []
  );

  // Coordinate conversion accounting for CSS scale/ratio
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return { x: 0, y: 0 };

    const rect = overlay.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const scaleX = overlay.width / rect.width;
    const scaleY = overlay.height / rect.height;

    const x = Math.max(0, Math.min(overlay.width, Math.round((clientX - rect.left) * scaleX)));
    const y = Math.max(0, Math.min(overlay.height, Math.round((clientY - rect.top) * scaleY)));

    return { x, y };
  };

  // Interactive Drag & Draw Event Handlers
  const handleStartSelect = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!file) return;
    const { x, y } = getCanvasCoords(e);
    setIsSelecting(true);
    setDragStart({ x, y });

    if (selectionType === "box") {
      setSelectionBox({ x, y, width: 0, height: 0 });
    } else {
      // Brush start: initialize brush box accumulator
      setSelectionBox({
        x: Math.max(0, x - brushSize),
        y: Math.max(0, y - brushSize),
        width: brushSize * 2,
        height: brushSize * 2,
      });
      drawBrushStroke(x, y);
    }
  };

  const handleMoveSelect = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isSelecting || !dragStart) return;
    const { x, y } = getCanvasCoords(e);

    if (selectionType === "box") {
      const startX = Math.min(dragStart.x, x);
      const startY = Math.min(dragStart.y, y);
      const w = Math.abs(x - dragStart.x);
      const h = Math.abs(y - dragStart.y);

      const box = { x: startX, y: startY, width: w, height: h };
      setSelectionBox(box);
      drawOverlaySelection(box);
    } else {
      drawBrushStroke(x, y);
      setSelectionBox((prev) => {
        if (!prev) return { x: x - brushSize, y: y - brushSize, width: brushSize * 2, height: brushSize * 2 };
        const minX = Math.min(prev.x, x - brushSize);
        const minY = Math.min(prev.y, y - brushSize);
        const maxX = Math.max(prev.x + prev.width, x + brushSize);
        const maxY = Math.max(prev.y + prev.height, y + brushSize);
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
      });
    }
  };

  const handleEndSelect = () => {
    if (!isSelecting) return;
    setIsSelecting(false);
    setDragStart(null);
    if (selectionBox && selectionBox.width > 5 && selectionBox.height > 5) {
      drawOverlaySelection(selectionBox);
      toast.info(`Area marked (${Math.round(selectionBox.width)}x${Math.round(selectionBox.height)}px). Choose Erase or Blur.`);
    }
  };

  const drawBrushStroke = (x: number, y: number) => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "rgba(239, 68, 68, 0.35)";
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  // Quick Preset Corners
  const setQuickCorner = (preset: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center") => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const w = overlay.width;
    const h = overlay.height;

    let box: SelectionBox;
    const patchW = Math.round(w * 0.32);
    const patchH = Math.round(h * 0.22);

    if (preset === "bottom-right") {
      box = { x: w - patchW, y: h - patchH, width: patchW, height: patchH };
    } else if (preset === "bottom-left") {
      box = { x: 0, y: h - patchH, width: patchW, height: patchH };
    } else if (preset === "top-right") {
      box = { x: w - patchW, y: 0, width: patchW, height: patchH };
    } else if (preset === "top-left") {
      box = { x: 0, y: 0, width: patchW, height: patchH };
    } else {
      const cW = Math.round(w * 0.45);
      const cH = Math.round(h * 0.35);
      box = { x: Math.round((w - cW) / 2), y: Math.round((h - cH) / 2), width: cW, height: cH };
    }

    setSelectionBox(box);
    drawOverlaySelection(box);
    toast.success(`Selected ${preset.replace("-", " ")} region`);
  };

  const clearSelection = () => {
    setSelectionBox(null);
    const overlay = overlayCanvasRef.current;
    if (overlay) {
      const ctx = overlay.getContext("2d");
      ctx?.clearRect(0, 0, overlay.width, overlay.height);
    }
  };

  // Execute Watermark Removal / Blur / Pixelate
  const handleApplyWatermarkAction = async () => {
    if (!selectionBox || selectionBox.width <= 4 || selectionBox.height <= 4) {
      toast.error("Please click & drag on the image to mark the watermark area first.");
      return;
    }

    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) return;
    const ctx = mainCanvas.getContext("2d");
    if (!ctx) return;

    setLoading(true);

    try {
      // Push current canvas state to history stack for instant Undo
      setHistoryStack((prev) => [...prev, mainCanvas.toDataURL()]);

      let { x, y, width: w, height: h } = selectionBox;
      x = Math.max(0, Math.min(x, mainCanvas.width - 1));
      y = Math.max(0, Math.min(y, mainCanvas.height - 1));
      w = Math.max(1, Math.min(w, mainCanvas.width - x));
      h = Math.max(1, Math.min(h, mainCanvas.height - y));

      if (activeAction === "blur") {
        // High-Quality Gaussian Blur
        const temp = document.createElement("canvas");
        temp.width = w;
        temp.height = h;
        const tCtx = temp.getContext("2d")!;
        const blurRadius = Math.max(5, Math.round((intensity / 100) * 22));
        tCtx.filter = `blur(${blurRadius}px)`;
        tCtx.drawImage(mainCanvas, x, y, w, h, 0, 0, w, h);
        ctx.drawImage(temp, x, y);
        toast.success("Watermark blurred successfully!");
      } else if (activeAction === "pixelate") {
        // Censor Pixelate Mosaic
        const blockSize = Math.max(4, Math.round((intensity / 100) * 24));
        const smallW = Math.max(1, Math.floor(w / blockSize));
        const smallH = Math.max(1, Math.floor(h / blockSize));

        const temp = document.createElement("canvas");
        temp.width = smallW;
        temp.height = smallH;
        const tCtx = temp.getContext("2d")!;
        tCtx.imageSmoothingEnabled = false;
        tCtx.drawImage(mainCanvas, x, y, w, h, 0, 0, smallW, smallH);

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(temp, 0, 0, smallW, smallH, x, y, w, h);
        ctx.imageSmoothingEnabled = true;
        toast.success("Watermark censored with pixel mosaic!");
      } else {
        // Content-Aware AI Texture Inpainting & Erase
        const rim = 6;
        const sampleX = Math.max(0, x - rim);
        const sampleY = Math.max(0, y - rim);
        const sampleW = Math.min(mainCanvas.width - sampleX, w + rim * 2);
        const sampleH = Math.min(mainCanvas.height - sampleY, h + rim * 2);

        const imgData = ctx.getImageData(sampleX, sampleY, sampleW, sampleH);
        const data = imgData.data;

        const localX = x - sampleX;
        const localY = y - sampleY;

        for (let j = 0; j < h; j++) {
          for (let i = 0; i < w; i++) {
            const curX = localX + i;
            const curY = localY + j;

            const topIdx = (Math.max(0, localY - 1) * sampleW + curX) * 4;
            const btmIdx = (Math.min(sampleH - 1, localY + h) * sampleW + curX) * 4;
            const lftIdx = (curY * sampleW + Math.max(0, localX - 1)) * 4;
            const rgtIdx = (curY * sampleW + Math.min(sampleW - 1, localX + w)) * 4;

            const vWeight = (j + 1) / (h + 1);
            const hWeight = (i + 1) / (w + 1);

            const rV = data[topIdx] * (1 - vWeight) + data[btmIdx] * vWeight;
            const gV = data[topIdx + 1] * (1 - vWeight) + data[btmIdx + 1] * vWeight;
            const bV = data[topIdx + 2] * (1 - vWeight) + data[btmIdx + 2] * vWeight;

            const rH = data[lftIdx] * (1 - hWeight) + data[rgtIdx] * hWeight;
            const gH = data[lftIdx + 1] * (1 - hWeight) + data[rgtIdx + 1] * hWeight;
            const bH = data[lftIdx + 2] * (1 - hWeight) + data[rgtIdx + 2] * hWeight;

            const noise = (Math.random() - 0.5) * 2;
            const destIdx = (curY * sampleW + curX) * 4;

            data[destIdx] = Math.max(0, Math.min(255, Math.round((rV + rH) / 2 + noise)));
            data[destIdx + 1] = Math.max(0, Math.min(255, Math.round((gV + gH) / 2 + noise)));
            data[destIdx + 2] = Math.max(0, Math.min(255, Math.round((bV + bH) / 2 + noise)));
            data[destIdx + 3] = 255;
          }
        }

        ctx.putImageData(imgData, sampleX, sampleY);

        // Smooth boundary feathering
        const featherTemp = document.createElement("canvas");
        featherTemp.width = w;
        featherTemp.height = h;
        const fCtx = featherTemp.getContext("2d")!;
        fCtx.filter = "blur(4px)";
        fCtx.drawImage(mainCanvas, x, y, w, h, 0, 0, w, h);
        ctx.globalAlpha = 0.5;
        ctx.drawImage(featherTemp, x, y);
        ctx.globalAlpha = 1.0;

        toast.success("Watermark seamlessly erased and filled!");
      }

      // Update output result state and clear active selection
      const newUrl = mainCanvas.toDataURL("image/png");
      setResultBase64(newUrl);
      clearSelection();
    } catch (err: any) {
      console.error("[handleApplyWatermarkAction] Error:", err);
      toast.error("Removal failed: " + (err?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Undo previous action
  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const prevDataUrl = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));

    const img = new Image();
    img.src = prevDataUrl;
    img.onload = () => {
      const mainCanvas = mainCanvasRef.current;
      if (!mainCanvas) return;
      const ctx = mainCanvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        ctx.drawImage(img, 0, 0);
        setResultBase64(mainCanvas.toDataURL());
        clearSelection();
        toast.info("Reverted to previous state.");
      }
    };
  };

  // Reset to original
  const handleResetToOriginal = () => {
    if (!originalSrc) return;
    const img = new Image();
    img.src = originalSrc;
    img.onload = () => {
      const mainCanvas = mainCanvasRef.current;
      if (!mainCanvas) return;
      const ctx = mainCanvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        ctx.drawImage(img, 0, 0);
        setResultBase64(mainCanvas.toDataURL());
        setHistoryStack([]);
        clearSelection();
        toast.success("Reset to original image.");
      }
    };
  };

  // Client-Side Canvas Engine for instant, lag-free processing on mobile and desktop
  const processImageOnCanvas = async (
    sourceFile: File,
    toolSlug: string,
    params: Record<string, string>
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(sourceFile);
      img.crossOrigin = "anonymous";

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const width = img.naturalWidth || 800;
        const height = img.naturalHeight || 600;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);

        try {
          switch (toolSlug) {
            case "add-text-to-image": {
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0);

              const text = params.text || "Korevante Studio";
              const position = params.position || "Bottom";
              const colorName = params.color || "White";
              const userFontSize = parseInt(params.fontSize) || 48;

              const colorMap: Record<string, string> = {
                White: "#FFFFFF",
                Yellow: "#FBBF24",
                Cyan: "#06B6D4",
                Black: "#000000",
              };
              const hexColor = colorMap[colorName] || "#FFFFFF";

              // Responsive font scaling for crisp high-resolution display
              const scale = width / 1200;
              const responsiveFontSize = Math.max(16, Math.round(userFontSize * Math.max(0.6, scale)));

              let yPos = Math.round(height * 0.9);
              if (position === "Center") yPos = Math.round(height * 0.5);
              if (position === "Top") yPos = Math.round(height * 0.15);

              ctx.font = `bold ${responsiveFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";

              // High-contrast outline so text is always 100% visible on any background
              ctx.strokeStyle = hexColor === "#000000" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)";
              ctx.lineWidth = Math.max(2, Math.round(responsiveFontSize / 12));
              ctx.strokeText(text, Math.round(width / 2), yPos);

              ctx.fillStyle = hexColor;
              ctx.fillText(text, Math.round(width / 2), yPos);

              resolve(canvas.toDataURL(sourceFile.type === "image/png" ? "image/png" : "image/jpeg", 0.92));
              break;
            }

            case "image-resizer": {
              const w = parseInt(params.width);
              const h = parseInt(params.height);
              let targetW = width;
              let targetH = height;

              if (w && h) {
                targetW = w;
                targetH = h;
              } else if (w) {
                targetW = w;
                targetH = Math.round((height * w) / width);
              } else if (h) {
                targetH = h;
                targetW = Math.round((width * h) / height);
              }

              canvas.width = targetW;
              canvas.height = targetH;
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = "high";
              ctx.drawImage(img, 0, 0, targetW, targetH);
              resolve(canvas.toDataURL(sourceFile.type === "image/png" ? "image/png" : "image/jpeg", 0.92));
              break;
            }

            case "image-compressor": {
              const quality = (parseInt(params.quality) || 60) / 100;
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL("image/jpeg", Math.min(0.99, Math.max(0.1, quality))));
              break;
            }

            case "image-converter": {
              const format = params.format || "webp";
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0);
              const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
              resolve(canvas.toDataURL(mime, 0.92));
              break;
            }

            case "image-cropper": {
              const ratio = params.ratio || "1:1";
              let cropW = width;
              let cropH = height;

              if (ratio === "1:1") {
                cropW = Math.min(width, height);
                cropH = cropW;
              } else if (ratio === "16:9") {
                cropW = width;
                cropH = Math.round((width * 9) / 16);
                if (cropH > height) {
                  cropH = height;
                  cropW = Math.round((height * 16) / 9);
                }
              } else if (ratio === "9:16") {
                cropH = height;
                cropW = Math.round((height * 9) / 16);
                if (cropW > width) {
                  cropW = width;
                  cropH = Math.round((width * 16) / 9);
                }
              } else if (ratio === "4:3") {
                cropW = width;
                cropH = Math.round((width * 3) / 4);
                if (cropH > height) {
                  cropH = height;
                  cropW = Math.round((height * 4) / 3);
                }
              }

              const startX = Math.round((width - cropW) / 2);
              const startY = Math.round((height - cropH) / 2);

              canvas.width = cropW;
              canvas.height = cropH;
              ctx.drawImage(img, startX, startY, cropW, cropH, 0, 0, cropW, cropH);
              resolve(canvas.toDataURL(sourceFile.type === "image/png" ? "image/png" : "image/jpeg", 0.92));
              break;
            }

            case "image-enhancer": {
              const brightness = parseFloat(params.brightness) || 1.2;
              const saturation = parseFloat(params.saturation) || 1.5;
              canvas.width = width;
              canvas.height = height;
              ctx.filter = `brightness(${brightness}) saturate(${saturation})`;
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL(sourceFile.type === "image/png" ? "image/png" : "image/jpeg", 0.92));
              break;
            }

            case "image-blur-tool": {
              const intensity = parseFloat(params.intensity) || 5;
              canvas.width = width;
              canvas.height = height;
              ctx.filter = `blur(${intensity}px)`;
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL(sourceFile.type === "image/png" ? "image/png" : "image/jpeg", 0.92));
              break;
            }

            case "image-filters": {
              const filter = params.filter || "Grayscale";
              canvas.width = width;
              canvas.height = height;
              if (filter === "Grayscale") ctx.filter = "grayscale(100%)";
              else if (filter === "Sepia") ctx.filter = "sepia(100%)";
              else if (filter === "High Contrast") ctx.filter = "contrast(160%)";
              else if (filter === "Vintage Cool") ctx.filter = "sepia(40%) hue-rotate(180deg) saturate(110%)";
              else if (filter === "Warm Sunset") ctx.filter = "sepia(40%) saturate(140%) brightness(105%)";
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL(sourceFile.type === "image/png" ? "image/png" : "image/jpeg", 0.92));
              break;
            }

            case "passport-photo-maker": {
              canvas.width = 640;
              canvas.height = 640;
              ctx.fillStyle = "#FFFFFF";
              ctx.fillRect(0, 0, 640, 640);

              const squareSize = Math.min(width, height);
              const startX = Math.round((width - squareSize) / 2);
              const startY = Math.round((height - squareSize) / 2);

              ctx.drawImage(img, startX, startY, squareSize, squareSize, 20, 20, 600, 600);
              resolve(canvas.toDataURL("image/jpeg", 0.95));
              break;
            }

            case "image-watermark-studio": {
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0);

              const text = params.text || "© KOREVANTE STUDIO";
              const style = params.style || "Diagonal Tiled";
              const opacityStr = params.opacity || "Medium";
              const colorName = params.color || "White";

              let alpha = 0.3;
              if (opacityStr.includes("Light")) alpha = 0.15;
              if (opacityStr.includes("Solid")) alpha = 0.6;

              const colorMap: Record<string, string> = {
                White: `rgba(255, 255, 255, ${alpha})`,
                Black: `rgba(0, 0, 0, ${alpha})`,
                Red: `rgba(239, 68, 68, ${alpha})`,
                Cyan: `rgba(6, 182, 212, ${alpha})`,
              };
              const fillStyle = colorMap[colorName] || `rgba(255, 255, 255, ${alpha})`;

              if (style.includes("Diagonal Tiled")) {
                ctx.save();
                ctx.rotate(-Math.PI / 6);
                ctx.font = `bold ${Math.max(16, Math.round(width / 35))}px sans-serif`;
                ctx.fillStyle = fillStyle;
                const stepX = Math.max(180, Math.round(width / 4));
                const stepY = Math.max(100, Math.round(height / 6));

                for (let x = -width; x < width * 2; x += stepX) {
                  for (let y = -height; y < height * 2; y += stepY) {
                    ctx.fillText(text, x, y);
                  }
                }
                ctx.restore();
              } else if (style.includes("Bottom Right")) {
                const fontSize = Math.max(18, Math.round(width / 30));
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.textAlign = "end";
                ctx.fillStyle = fillStyle;
                ctx.shadowColor = "rgba(0,0,0,0.5)";
                ctx.shadowBlur = 4;
                ctx.fillText(text, width - 30, height - 30);
              } else {
                const fontSize = Math.max(24, Math.round(width / 14));
                ctx.save();
                ctx.translate(width / 2, height / 2);
                ctx.rotate(-Math.PI / 6);
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = fillStyle;
                ctx.fillText(text, 0, 0);
                ctx.restore();
              }

              resolve(canvas.toDataURL(sourceFile.type === "image/png" ? "image/png" : "image/jpeg", 0.92));
              break;
            }

            default:
              resolve(null);
          }
        } catch (e) {
          console.warn("[processImageOnCanvas] Fallback to server:", e);
          resolve(null);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };

      img.src = objectUrl;
    });
  };

  // Generic Image tool processing for other image tools
  const handleGenericGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload an image first.");
      return;
    }

    setLoading(true);
    setResultBase64(null);
    const startTime = Date.now();

    try {
      // 1. Try instant client-side canvas processing (0ms network delay, no Vercel payload limit)
      const clientResult = await processImageOnCanvas(file, tool.slug, formData);
      if (clientResult) {
        setResultBase64(clientResult);
        toast.success("Image processed successfully!");
        // Record tool usage in background
        const elapsed = Date.now() - startTime;
        recordClientToolUsageAction(tool.slug, elapsed).catch(() => {});
        return;
      }

      // 2. Server-side Sharp processing fallback
      const safeFile = await optimizeImageForUpload(file, 2048, 0.88);

      const formPayload = new FormData();
      formPayload.append("file", safeFile);

      Object.entries(formData).forEach(([key, val]) => {
        formPayload.append(key, val);
      });

      const response = await processImageAction(tool.slug, formPayload);
      if (response.success && response.data) {
        setResultBase64(response.data);
        toast.success("Image processed successfully!");
      } else {
        toast.error(response.error || "Failed to process image.");
      }
    } catch (err: any) {
      console.error("[ImageToolClient]", err);
      toast.error(err?.message || "An unexpected error occurred while processing image.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const downloadUrl = resultBase64 || imageSrc;
    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${tool.slug}-result-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER: WATERMARK REMOVAL INTERACTIVE STUDIO
  // ─────────────────────────────────────────────────────────────
  if (isWatermarkRemover) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column: Studio Controls ── */}
        <Card className="lg:col-span-5 border-border/80 shadow-sm top-24 sticky">
          <div className="h-14 border-b border-border/50 flex items-center px-6 bg-muted/10 rounded-t-xl shrink-0">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Eraser className="h-4 w-4 text-primary" /> Interactive Watermark Studio
            </h3>
          </div>
          <CardContent className="p-6 space-y-6">
            {/* Upload Box */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                Upload Image <span className="text-destructive">*</span>
              </label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className={`w-full h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${
                    file ? "border-primary bg-primary/5" : "border-border bg-muted/20 group-hover:border-primary/50"
                  }`}
                >
                  <UploadCloud className={`h-6 w-6 mb-1 ${file ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-xs text-muted-foreground font-medium text-center px-4 truncate w-full">
                    {file ? file.name : "Click or drag photo with watermark"}
                  </span>
                </div>
              </div>
            </div>

            {/* Selection Mode Tooling */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Crop className="h-3.5 w-3.5 text-primary" /> Selection Method (Mark on Image)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={selectionType === "box" ? "gradient" : "outline"}
                  onClick={() => setSelectionType("box")}
                  className="h-9 text-xs gap-1.5 justify-center"
                >
                  <Crop className="h-3.5 w-3.5" /> Box Drag Area
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={selectionType === "brush" ? "gradient" : "outline"}
                  onClick={() => setSelectionType("brush")}
                  className="h-9 text-xs gap-1.5 justify-center"
                >
                  <Paintbrush className="h-3.5 w-3.5" /> Brush Marker
                </Button>
              </div>

              {selectionType === "brush" && (
                <div className="p-3 rounded-xl bg-muted/20 border border-border/40 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Brush Marker Size</span>
                    <span className="font-mono text-primary font-bold">{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium">Quick Corner Presets:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickCorner("bottom-right")}
                  className="text-xs py-1.5 px-2.5 rounded-lg border border-border bg-background hover:border-primary/50 text-left transition-colors"
                >
                  ↘ Bottom-Right
                </button>
                <button
                  type="button"
                  onClick={() => setQuickCorner("top-right")}
                  className="text-xs py-1.5 px-2.5 rounded-lg border border-border bg-background hover:border-primary/50 text-left transition-colors"
                >
                  ↗ Top-Right
                </button>
                <button
                  type="button"
                  onClick={() => setQuickCorner("bottom-left")}
                  className="text-xs py-1.5 px-2.5 rounded-lg border border-border bg-background hover:border-primary/50 text-left transition-colors"
                >
                  ↙ Bottom-Left
                </button>
                <button
                  type="button"
                  onClick={() => setQuickCorner("center")}
                  className="text-xs py-1.5 px-2.5 rounded-lg border border-border bg-background hover:border-primary/50 text-left transition-colors"
                >
                  ⏺ Center Stamp
                </button>
              </div>
            </div>

            {/* Action Mode: Inpaint vs Blur vs Pixelate */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-primary" /> Removal / Concealment Action
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/30 rounded-xl border border-border/60">
                <button
                  type="button"
                  onClick={() => setActiveAction("inpaint")}
                  className={`text-xs font-medium py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    activeAction === "inpaint"
                      ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sparkles className="h-3 w-3" /> Inpaint
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAction("blur")}
                  className={`text-xs font-medium py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    activeAction === "blur"
                      ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Droplet className="h-3 w-3" /> Blur
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAction("pixelate")}
                  className={`text-xs font-medium py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    activeAction === "pixelate"
                      ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Grid3X3 className="h-3 w-3" /> Censor
                </button>
              </div>

              {/* Intensity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Effect Intensity</span>
                  <span className="font-mono text-primary font-bold">{intensity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <Button
                type="button"
                onClick={handleApplyWatermarkAction}
                disabled={loading || !file || !selectionBox}
                variant="gradient"
                className="w-full gap-2 shadow-lg shadow-primary/20 h-11"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Eraser className="h-4 w-4" />
                    {activeAction === "blur"
                      ? "Blur Selected Area"
                      : activeAction === "pixelate"
                      ? "Pixelate Selected Area"
                      : "Erase & Inpaint Watermark"}
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={historyStack.length === 0}
                  className="flex-1 text-xs gap-1.5 h-9"
                >
                  <Undo2 className="h-3.5 w-3.5" /> Undo ({historyStack.length})
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  disabled={!selectionBox}
                  className="text-xs gap-1 h-9 px-3"
                  title="Clear Selection"
                >
                  <X className="h-3.5 w-3.5" /> Clear
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetToOriginal}
                  disabled={!file || historyStack.length === 0}
                  className="text-xs gap-1 h-9 px-3 text-destructive"
                  title="Reset to Original"
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Right Column: Interactive Canvas Viewport ── */}
        <Card className="lg:col-span-7 border-border/80 shadow-sm min-h-[540px] flex flex-col">
          <div className="h-14 border-b border-border/50 flex items-center justify-between px-6 bg-muted/10 rounded-t-xl shrink-0">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-foreground">Interactive Canvas Viewport</h3>
              {selectionBox && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-medium">
                  {Math.round(selectionBox.width)} × {Math.round(selectionBox.height)} px marked
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {file && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onMouseDown={() => setIsViewingOriginal(true)}
                  onMouseUp={() => setIsViewingOriginal(false)}
                  onTouchStart={() => setIsViewingOriginal(true)}
                  onTouchEnd={() => setIsViewingOriginal(false)}
                  className="text-xs gap-1 h-8 text-muted-foreground select-none"
                  title="Hold to inspect original image"
                >
                  {isViewingOriginal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {isViewingOriginal ? "Original" : "Hold: Compare"}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!resultBase64 && !imageSrc}
                className="h-8 gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> Download Result
              </Button>
            </div>
          </div>

          <CardContent className="p-0 flex-1 relative flex flex-col items-center justify-center min-h-[460px] bg-black/10 dark:bg-black/40 rounded-b-xl overflow-hidden select-none">
            {file && imageSrc ? (
              <div
                ref={containerRef}
                className="relative max-w-full max-h-[580px] p-4 flex items-center justify-center"
              >
                {/* Original Viewport overlay for Hold-to-Compare */}
                {isViewingOriginal && originalSrc && (
                  <img
                    src={originalSrc}
                    alt="Original"
                    className="absolute inset-0 m-auto max-w-full max-h-[580px] object-contain z-20 pointer-events-none rounded-lg"
                  />
                )}

                {/* Main Pixel Canvas */}
                <canvas
                  ref={mainCanvasRef}
                  className="max-w-full max-h-[580px] object-contain rounded-lg shadow-xl border border-border/80 block"
                />

                {/* Interactive Selection Canvas Layer */}
                <canvas
                  ref={overlayCanvasRef}
                  onMouseDown={handleStartSelect}
                  onMouseMove={handleMoveSelect}
                  onMouseUp={handleEndSelect}
                  onTouchStart={handleStartSelect}
                  onTouchMove={handleMoveSelect}
                  onTouchEnd={handleEndSelect}
                  className="absolute inset-0 m-auto max-w-full max-h-[580px] object-contain z-10 cursor-crosshair rounded-lg"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground opacity-60">
                <Eraser className="h-16 w-16 mb-4 opacity-25" />
                <p className="text-sm font-medium text-foreground">Upload an image to start removing watermarks</p>
                <p className="text-xs mt-1 max-w-sm">
                  Click and drag anywhere on your image to select a watermark, logo, or timestamp, then click Erase or Blur.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: GENERIC STUDIO FOR OTHER IMAGE TOOLS
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ── Left Column: Config Form ── */}
      <Card className="lg:col-span-4 border-border/80 shadow-sm top-24 sticky">
        <CardContent className="p-6">
          <form onSubmit={handleGenericGenerate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                Upload Image <span className="text-destructive">*</span>
              </label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className={`w-full h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${
                    file ? "border-primary bg-primary/5" : "border-border bg-muted/20 group-hover:border-primary/50"
                  }`}
                >
                  <UploadCloud className={`h-6 w-6 mb-1 ${file ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-xs text-muted-foreground font-medium text-center px-4 truncate w-full">
                    {file ? file.name : "Click or drag to upload"}
                  </span>
                </div>
              </div>
            </div>

            {config.fields.length > 0 && (
              <div className="space-y-5">
                {config.fields.map((field) => (
                  <div key={field.name} className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                      {field.label}
                    </label>

                    {field.type === "number" && (
                      <Input
                        type="number"
                        placeholder={field.placeholder}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        disabled={loading}
                        className="bg-background/50"
                        step="any"
                      />
                    )}

                    {field.type === "text" && (
                      <Input
                        type="text"
                        placeholder={field.placeholder}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        disabled={loading}
                        className="bg-background/50"
                      />
                    )}

                    {field.type === "select" && field.options && (
                      <select
                        value={formData[field.name] || ""}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        disabled={loading}
                        className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50"
                      >
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !file}
              variant="gradient"
              className="w-full gap-2 shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" /> Process Image
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Right Column: Output Result ── */}
      <Card className="lg:col-span-8 border-border/80 shadow-sm min-h-[500px] flex flex-col">
        <div className="h-14 border-b border-border/50 flex items-center justify-between px-6 bg-muted/10 rounded-t-xl shrink-0">
          <h3 className="text-sm font-semibold text-foreground">Output Preview</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!resultBase64}
            className="h-8 gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
        </div>

        <CardContent className="p-0 flex-1 relative flex flex-col items-center justify-center min-h-[400px] bg-black/5 dark:bg-white/5 rounded-b-xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <RefreshCcw className="h-6 w-6 text-primary animate-spin" />
              </div>
              <p className="text-sm font-medium text-foreground">Processing Image...</p>
            </div>
          ) : resultBase64 ? (
            <div className="p-4 w-full h-full flex items-center justify-center">
              <img
                src={resultBase64}
                alt="Processed output"
                className="max-w-full max-h-[600px] object-contain rounded-md shadow-md"
              />
            </div>
          ) : file ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">Image loaded. Configure settings and click Process.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground opacity-60">
              <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">Upload an image to see the preview here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
