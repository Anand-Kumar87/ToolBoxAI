"use server";

import sharp from "sharp";
import { getServerAuthSession } from "@/lib/auth";
import { checkUserAccessAndLimits, recordToolUsage } from "@/services/usage";

// Limit payloads to ~4MB for server actions to prevent Next.js 413 Payload Too Large
export async function processImageAction(toolSlug: string, formData: FormData) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const userId = (session.user as any).id as string;

    const access = await checkUserAccessAndLimits(userId, toolSlug);
    if (!access.allowed) {
      return { success: false, error: access.reason || "Access denied" };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No image file provided." };
    }

    // SECURITY: Limit input size to 25MB to prevent buffer exhaustion
    const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
    if (file.size > MAX_IMAGE_BYTES) {
      return { success: false, error: "Image file exceeds maximum allowable size (25MB)." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const startTime = Date.now();
    let processedBuffer: Buffer = buffer;
    let mimeType = file.type || "image/png";

    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;

    // SECURITY: Limit resolution to prevent pixel decompression bombs
    if (width > 8192 || height > 8192) {
      return { success: false, error: "Image resolution exceeds safety limit (8192x8192 px max)." };
    }

    switch (toolSlug) {
      case "image-resizer": {
        const w = parseInt(formData.get("width") as string);
        const h = parseInt(formData.get("height") as string);
        if (w && h) processedBuffer = await sharp(buffer).resize(w, h, { fit: "fill" }).toBuffer();
        else if (w) processedBuffer = await sharp(buffer).resize({ width: w }).toBuffer();
        else if (h) processedBuffer = await sharp(buffer).resize({ height: h }).toBuffer();
        break;
      }

      case "image-compressor": {
        const quality = parseInt(formData.get("quality") as string) || 60;
        processedBuffer = await sharp(buffer).jpeg({ quality, mozjpeg: true }).toBuffer();
        mimeType = "image/jpeg";
        break;
      }

      case "image-converter": {
        const format = formData.get("format") as string; // 'jpeg', 'png', 'webp'
        if (format === "jpeg") processedBuffer = await sharp(buffer).jpeg().toBuffer();
        else if (format === "png") processedBuffer = await sharp(buffer).png().toBuffer();
        else if (format === "webp") processedBuffer = await sharp(buffer).webp().toBuffer();
        mimeType = `image/${format}`;
        break;
      }

      case "image-cropper": {
        const ratio = formData.get("ratio") as string;
        let targetW = width;
        let targetH = height;

        if (ratio === "1:1") { targetW = Math.min(width, height); targetH = targetW; }
        else if (ratio === "16:9") { targetW = width; targetH = Math.round(width * 9 / 16); }
        else if (ratio === "9:16") { targetH = height; targetW = Math.round(height * 9 / 16); }
        else if (ratio === "4:3") { targetW = width; targetH = Math.round(width * 3 / 4); }

        processedBuffer = await sharp(buffer).resize(targetW, targetH, { fit: "cover", position: "center" }).toBuffer();
        break;
      }

      case "image-enhancer": {
        const brightness = parseFloat(formData.get("brightness") as string) || 1.2;
        const saturation = parseFloat(formData.get("saturation") as string) || 1.5;
        processedBuffer = await sharp(buffer).modulate({ brightness, saturation }).toBuffer();
        break;
      }

      case "image-blur-tool": {
        const sigma = parseFloat(formData.get("intensity") as string) || 5;
        processedBuffer = await sharp(buffer).blur(sigma).toBuffer();
        break;
      }

      case "image-sharpener": {
        processedBuffer = await sharp(buffer).sharpen().toBuffer();
        break;
      }

      case "image-filters": {
        const filter = formData.get("filter") as string;
        if (filter === "Grayscale") {
          processedBuffer = await sharp(buffer).grayscale().toBuffer();
        } else if (filter === "Sepia") {
          processedBuffer = await sharp(buffer).recomb([
            [0.393, 0.769, 0.189],
            [0.349, 0.686, 0.168],
            [0.272, 0.534, 0.131],
          ]).toBuffer();
        } else if (filter === "High Contrast") {
          processedBuffer = await sharp(buffer).linear(1.5, -0.2).toBuffer();
        } else if (filter === "Vintage Cool") {
          processedBuffer = await sharp(buffer).modulate({ saturation: 0.8 }).tint({ r: 200, g: 230, b: 255 }).toBuffer();
        } else if (filter === "Warm Sunset") {
          processedBuffer = await sharp(buffer).modulate({ brightness: 1.1, saturation: 1.3 }).tint({ r: 255, g: 220, b: 180 }).toBuffer();
        } else {
          processedBuffer = await sharp(buffer).toBuffer();
        }
        break;
      }

      case "image-upscaler": {
        const scaleOption = (formData.get("scale") as string) || "2x";
        const factor = scaleOption.includes("4x") ? 4 : 2;
        const targetW = Math.min(4000, width * factor);
        const targetH = Math.min(4000, height * factor);

        processedBuffer = await sharp(buffer)
          .resize(targetW, targetH, { kernel: "lanczos3" })
          .sharpen({ sigma: 1.2, m1: 1.5, m2: 0.5 })
          .png({ quality: 100 })
          .toBuffer();
        mimeType = "image/png";
        break;
      }

      case "background-remover": {
        const tol = Math.max(15, Math.min(80, parseInt(formData.get("tolerance") as string) || 35));
        const { data, info } = await sharp(buffer)
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });

        // Sample background color from image corners
        const cornerIndices = [
          0,
          (info.width - 1) * 4,
          (info.height - 1) * info.width * 4,
          ((info.height - 1) * info.width + (info.width - 1)) * 4,
        ];
        let bgR = 0, bgG = 0, bgB = 0;
        cornerIndices.forEach((idx) => {
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        });
        bgR = Math.round(bgR / 4);
        bgG = Math.round(bgG / 4);
        bgB = Math.round(bgB / 4);

        // Compute chroma/luminance distance and make matching pixels transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

          if (dist < tol) {
            data[i + 3] = 0; // Fully transparent
          } else if (dist < tol + 15) {
            data[i + 3] = Math.round(((dist - tol) / 15) * 255); // Smooth feathering
          }
        }

        processedBuffer = await sharp(data, {
          raw: { width: info.width, height: info.height, channels: 4 },
        })
          .png()
          .toBuffer();
        mimeType = "image/png";
        break;
      }

      case "background-changer": {
        const tol = Math.max(15, Math.min(80, parseInt(formData.get("tolerance") as string) || 35));
        const bgColorChoice = (formData.get("bgColor") as string) || "Studio White";
        const colorMap: Record<string, { r: number; g: number; b: number }> = {
          "Studio White": { r: 255, g: 255, b: 255 },
          "Midnight Slate": { r: 15, g: 23, b: 42 },
          "Clean Gray": { r: 243, g: 244, b: 246 },
          "Cyberpunk Blue": { r: 2, g: 6, b: 23 },
          "Luxury Emerald": { r: 6, g: 78, b: 59 },
        };
        const bg = colorMap[bgColorChoice] || { r: 255, g: 255, b: 255 };

        // 1. Create cutout
        const { data, info } = await sharp(buffer)
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });

        const cornerIndices = [
          0,
          (info.width - 1) * 4,
          (info.height - 1) * info.width * 4,
          ((info.height - 1) * info.width + (info.width - 1)) * 4,
        ];
        let bgR = 0, bgG = 0, bgB = 0;
        cornerIndices.forEach((idx) => {
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        });
        bgR = Math.round(bgR / 4);
        bgG = Math.round(bgG / 4);
        bgB = Math.round(bgB / 4);

        for (let i = 0; i < data.length; i += 4) {
          const dist = Math.sqrt((data[i] - bgR) ** 2 + (data[i + 1] - bgG) ** 2 + (data[i + 2] - bgB) ** 2);
          if (dist < tol) {
            data[i + 3] = 0;
          } else if (dist < tol + 15) {
            data[i + 3] = Math.round(((dist - tol) / 15) * 255);
          }
        }

        const cutoutPng = await sharp(data, {
          raw: { width: info.width, height: info.height, channels: 4 },
        }).png().toBuffer();

        // 2. Create colored canvas and composite cutout on top
        processedBuffer = await sharp({
          create: {
            width: info.width,
            height: info.height,
            channels: 4,
            background: { r: bg.r, g: bg.g, b: bg.b, alpha: 1 },
          },
        })
          .composite([{ input: cutoutPng }])
          .png()
          .toBuffer();
        mimeType = "image/png";
        break;
      }

      case "add-text-to-image": {
        const text = (formData.get("text") as string) || "Korevante Studio";
        const position = (formData.get("position") as string) || "Bottom";
        const colorName = (formData.get("color") as string) || "White";
        const fontSize = parseInt(formData.get("fontSize") as string) || 48;

        const colorMap: Record<string, string> = {
          White: "#FFFFFF",
          Yellow: "#FBBF24",
          Cyan: "#06B6D4",
          Black: "#000000",
        };
        const hexColor = colorMap[colorName] || "#FFFFFF";

        let yPos = Math.round(height * 0.9);
        if (position === "Center") yPos = Math.round(height * 0.5);
        if (position === "Top") yPos = Math.round(height * 0.15);

        const safeText = text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");

        // Clean, valid SVG with XML namespace and outline for contrast - 100% compatible with librsvg on Linux
        const strokeWidth = Math.max(1, Math.round(fontSize / 24));
        const strokeColor = hexColor === "#000000" ? "#FFFFFF" : "#000000";
        const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
          <text x="${Math.round(width / 2)}" y="${yPos}" fill="${hexColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" font-size="${fontSize}" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-weight="bold" text-anchor="middle">${safeText}</text>
        </svg>`;

        processedBuffer = await sharp(buffer)
          .composite([{ input: Buffer.from(svg) }])
          .toBuffer();
        break;
      }

      case "passport-photo-maker": {
        // Standard passport: 2x2 inch at 300dpi = 600x600 px
        const cropSize = Math.min(width, height);
        const squareCropped = await sharp(buffer)
          .resize(cropSize, cropSize, { fit: "cover", position: "center" })
          .resize(600, 600)
          .toBuffer();

        // Ensure white border / background composite
        processedBuffer = await sharp({
          create: {
            width: 640,
            height: 640,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          },
        })
          .composite([{ input: squareCropped, top: 20, left: 20 }])
          .jpeg({ quality: 95 })
          .toBuffer();
        mimeType = "image/jpeg";
        break;
      }

      case "collage-maker": {
        // Create side-by-side or stacked grid layout
        const layout = (formData.get("layout") as string) || "Side-by-Side";
        const thumb = await sharp(buffer).resize(400, 400, { fit: "cover" }).toBuffer();

        if (layout.includes("Stacked")) {
          processedBuffer = await sharp({
            create: {
              width: 440,
              height: 860,
              channels: 4,
              background: { r: 24, g: 24, b: 27, alpha: 1 },
            },
          })
            .composite([
              { input: thumb, top: 20, left: 20 },
              { input: thumb, top: 440, left: 20 },
            ])
            .jpeg({ quality: 90 })
            .toBuffer();
        } else {
          processedBuffer = await sharp({
            create: {
              width: 860,
              height: 440,
              channels: 4,
              background: { r: 24, g: 24, b: 27, alpha: 1 },
            },
          })
            .composite([
              { input: thumb, top: 20, left: 20 },
              { input: thumb, top: 20, left: 440 },
            ])
            .jpeg({ quality: 90 })
            .toBuffer();
        }
        mimeType = "image/jpeg";
        break;
      }

      case "image-watermark-studio": {
        const text = (formData.get("text") as string) || "© KOREVANTE STUDIO";
        const style = (formData.get("style") as string) || "Diagonal Tiled";
        const opacityStr = (formData.get("opacity") as string) || "Medium";
        const colorName = (formData.get("color") as string) || "White";

        let alpha = 0.3;
        if (opacityStr.includes("Light")) alpha = 0.15;
        if (opacityStr.includes("Solid")) alpha = 0.6;

        const colorMap: Record<string, string> = {
          White: "255, 255, 255",
          Black: "0, 0, 0",
          Red: "239, 68, 68",
          Cyan: "6, 182, 212",
        };
        const rgbColor = colorMap[colorName] || "255, 255, 255";
        const safeText = text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");

        let svg = "";
        if (style.includes("Diagonal Tiled")) {
          const tileW = Math.max(200, Math.round(width / 3));
          const tileH = Math.max(140, Math.round(height / 4));
          svg = `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="wmPattern" width="${tileW}" height="${tileH}" patternTransform="rotate(-30)" patternUnits="userSpaceOnUse">
                  <text x="20" y="40" fill="rgba(${rgbColor}, ${alpha})" font-size="28" font-family="DejaVu Sans, Arial, sans-serif" font-weight="bold">${safeText}</text>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#wmPattern)" />
            </svg>
          `;
        } else if (style.includes("Bottom Right")) {
          svg = `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
              <text x="${width - 30}" y="${height - 30}" text-anchor="end" fill="rgba(${rgbColor}, ${alpha * 1.5})" font-size="32" font-family="DejaVu Sans, Arial, sans-serif" font-weight="bold">${safeText}</text>
            </svg>
          `;
        } else {
          svg = `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
              <text x="${Math.round(width / 2)}" y="${Math.round(height / 2)}" text-anchor="middle" transform="rotate(-30 ${Math.round(width / 2)} ${Math.round(height / 2)})" fill="rgba(${rgbColor}, ${alpha})" font-size="${Math.round(width / 12)}" font-family="DejaVu Sans, Arial, sans-serif" font-weight="bold">${safeText}</text>
            </svg>
          `;
        }

        processedBuffer = await sharp(buffer)
          .composite([{ input: Buffer.from(svg) }])
          .toBuffer();
        break;
      }

      case "watermark-remover": {
        const actionType = (formData.get("actionType") as string) || "inpaint"; // "inpaint" | "blur" | "pixelate"
        const region = (formData.get("region") as string) || "Bottom-Right Corner";
        const mode = (formData.get("mode") as string) || "AI Bilateral";
        const intensity = Math.min(100, Math.max(10, parseInt(formData.get("intensity") as string) || 80));

        // Read optional custom user-selected coordinates
        const customLeft = parseInt(formData.get("customLeft") as string);
        const customTop = parseInt(formData.get("customTop") as string);
        const customWidth = parseInt(formData.get("customWidth") as string);
        const customHeight = parseInt(formData.get("customHeight") as string);

        let left = 0;
        let top = 0;
        let patchWidth = Math.round(width * 0.32);
        let patchHeight = Math.round(height * 0.22);

        if (!isNaN(customLeft) && !isNaN(customTop) && customWidth > 0 && customHeight > 0) {
          left = customLeft;
          top = customTop;
          patchWidth = customWidth;
          patchHeight = customHeight;
        } else if (region.includes("Bottom-Right")) {
          left = Math.max(0, width - patchWidth);
          top = Math.max(0, height - patchHeight);
        } else if (region.includes("Bottom-Left")) {
          left = 0;
          top = Math.max(0, height - patchHeight);
        } else if (region.includes("Top-Right")) {
          left = Math.max(0, width - patchWidth);
          top = 0;
        } else if (region.includes("Top-Left")) {
          left = 0;
          top = 0;
        } else if (region.includes("Center")) {
          patchWidth = Math.round(width * 0.5);
          patchHeight = Math.round(height * 0.4);
          left = Math.round((width - patchWidth) / 2);
          top = Math.round((height - patchHeight) / 2);
        } else {
          // Full Image Multi-Area
          patchWidth = width;
          patchHeight = height;
          left = 0;
          top = 0;
        }

        // Clamp bounding box to valid image dimensions
        left = Math.max(0, Math.min(left, width - 1));
        top = Math.max(0, Math.min(top, height - 1));
        patchWidth = Math.max(1, Math.min(patchWidth, width - left));
        patchHeight = Math.max(1, Math.min(patchHeight, height - top));

        // Inpaint and reconstruct the targeted watermark patch
        const sigma = Math.max(3, Math.round((intensity / 100) * 16));
        const medianSize = intensity > 60 ? 5 : 3;

        let inpaintedPatch: Buffer;

        if (actionType === "blur" || mode.includes("Blur")) {
          // Gaussian Blur of selected region
          inpaintedPatch = await sharp(buffer)
            .extract({ left, top, width: patchWidth, height: patchHeight })
            .blur(sigma)
            .toBuffer();
        } else if (actionType === "pixelate" || mode.includes("Pixelate")) {
          // Censor / Pixelate mosaic of selected region
          const pixelBlockSize = Math.max(3, Math.round(patchWidth / 15));
          const smallW = Math.max(2, Math.floor(patchWidth / pixelBlockSize));
          const smallH = Math.max(2, Math.floor(patchHeight / pixelBlockSize));

          inpaintedPatch = await sharp(buffer)
            .extract({ left, top, width: patchWidth, height: patchHeight })
            .resize(smallW, smallH, { kernel: "nearest" })
            .resize(patchWidth, patchHeight, { kernel: "nearest" })
            .toBuffer();
        } else if (mode.includes("Median")) {
          inpaintedPatch = await sharp(buffer)
            .extract({ left, top, width: patchWidth, height: patchHeight })
            .median(medianSize)
            .blur(sigma / 2)
            .toBuffer();
        } else if (mode.includes("Neutralizer")) {
          inpaintedPatch = await sharp(buffer)
            .extract({ left, top, width: patchWidth, height: patchHeight })
            .blur(sigma)
            .modulate({ saturation: 0.95, brightness: 1.02 })
            .toBuffer();
        } else {
          // AI Bilateral Content Inpainting (Seamless texture blend)
          inpaintedPatch = await sharp(buffer)
            .extract({ left, top, width: patchWidth, height: patchHeight })
            .median(medianSize)
            .blur(Math.max(2, Math.round(sigma * 0.75)))
            .toBuffer();
        }

        // Composite the reconstructed clean patch seamlessly over the watermark
        processedBuffer = await sharp(buffer)
          .composite([
            {
              input: inpaintedPatch,
              left,
              top,
              blend: "over",
            },
          ])
          .toBuffer();
        break;
      }

      default:
        processedBuffer = await sharp(buffer).toBuffer();
    }

    // CRITICAL: Ensure base64 payload is bounded (< 2MB) to prevent Vercel 4.5MB Serverless response limit crash
    if (processedBuffer.length > 2 * 1024 * 1024) {
      processedBuffer = await sharp(processedBuffer)
        .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      mimeType = "image/jpeg";
    }

    const executionTimeMs = Date.now() - startTime;
    const base64 = `data:${mimeType};base64,${processedBuffer.toString("base64")}`;

    await recordToolUsage({
      userId,
      toolSlug,
      executionTimeMs,
      status: "SUCCESS",
    });

    return { success: true, data: base64 };
  } catch (error: any) {
    console.error("[processImageAction] Error:", error);
    return { success: false, error: "Image processing failed: " + (error?.message || "Unknown error") };
  }
}
