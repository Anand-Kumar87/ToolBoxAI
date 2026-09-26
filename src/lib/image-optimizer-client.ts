/**
 * Client-Side Smart Image Optimizer
 * 
 * Automatically downsizes and compresses camera/gallery photos (often 8MB - 20MB, 48MP)
 * before upload, preventing Vercel's 4.5MB Serverless request body rejection and
 * preventing mobile browser canvas memory crashes.
 */

export async function optimizeImageForUpload(
  file: File,
  maxDimension = 2048,
  quality = 0.88
): Promise<File> {
  // If not an image or SVG/GIF, return as-is
  if (!file.type.startsWith("image/") || file.type.includes("svg") || file.type.includes("gif")) {
    return file;
  }

  // If already under 3MB, check dimensions quickly
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;

        // If file is already small AND dimensions are reasonable, don't modify
        if (file.size <= 3.5 * 1024 * 1024 && width <= maxDimension && height <= maxDimension) {
          resolve(file);
          return;
        }

        // Calculate proportional scale
        let targetW = width;
        let targetH = height;

        if (targetW > maxDimension || targetH > maxDimension) {
          if (targetW > targetH) {
            targetH = Math.round((targetH * maxDimension) / targetW);
            targetW = maxDimension;
          } else {
            targetW = Math.round((targetW * maxDimension) / targetH);
            targetH = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, targetW, targetH);

        // Retain original mime type if PNG and transparent, else use JPEG/WebP for high compression
        const outputMime = file.type === "image/png" ? "image/png" : "image/jpeg";

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + (outputMime === "image/png" ? ".png" : ".jpg"), {
              type: outputMime,
              lastModified: Date.now(),
            });

            console.log(
              `[ImageOptimizer] Downscaled ${(file.size / 1024 / 1024).toFixed(2)}MB (${width}x${height}) ➔ ${(optimizedFile.size / 1024 / 1024).toFixed(2)}MB (${targetW}x${targetH})`
            );

            resolve(optimizedFile);
          },
          outputMime,
          quality
        );
      };

      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
