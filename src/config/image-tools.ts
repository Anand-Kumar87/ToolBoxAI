export type ImageFieldType = "number" | "select" | "text";

export interface ImageFieldDef {
  name: string;
  label: string;
  type: ImageFieldType;
  placeholder?: string;
  options?: string[];
  defaultValue?: string | number;
}

export interface ImageToolConfig {
  slug: string;
  fields: ImageFieldDef[];
  allowMultipleFiles?: boolean;
}

export const IMAGE_TOOLS_CONFIG: Record<string, ImageToolConfig> = {
  "image-resizer": {
    slug: "image-resizer",
    fields: [
      { name: "width", label: "Width (px)", type: "number", placeholder: "e.g. 1920" },
      { name: "height", label: "Height (px)", type: "number", placeholder: "e.g. 1080" },
    ],
  },
  "image-compressor": {
    slug: "image-compressor",
    fields: [
      { name: "quality", label: "Quality (1-100)", type: "number", defaultValue: 60, placeholder: "60" },
    ],
  },
  "image-converter": {
    slug: "image-converter",
    fields: [
      { name: "format", label: "Target Format", type: "select", options: ["jpeg", "png", "webp"], defaultValue: "webp" },
    ],
  },
  "image-cropper": {
    slug: "image-cropper",
    fields: [
      { name: "ratio", label: "Aspect Ratio", type: "select", options: ["1:1", "16:9", "9:16", "4:3"], defaultValue: "1:1" },
    ],
  },
  "image-enhancer": {
    slug: "image-enhancer",
    fields: [
      { name: "brightness", label: "Brightness (Multiplier)", type: "number", defaultValue: 1.2 },
      { name: "saturation", label: "Saturation (Multiplier)", type: "number", defaultValue: 1.5 },
    ],
  },
  "image-blur-tool": {
    slug: "image-blur-tool",
    fields: [
      { name: "intensity", label: "Blur Intensity (Sigma)", type: "number", defaultValue: 5 },
    ],
  },
  "image-sharpener": {
    slug: "image-sharpener",
    fields: [],
  },
  "image-filters": {
    slug: "image-filters",
    fields: [
      { name: "filter", label: "Filter Type", type: "select", options: ["Grayscale", "Sepia", "High Contrast", "Vintage Cool", "Warm Sunset"] },
    ],
  },
  "image-upscaler": {
    slug: "image-upscaler",
    fields: [
      { name: "scale", label: "Upscale Factor", type: "select", options: ["2x High-Def", "4x Ultra-HD"], defaultValue: "2x High-Def" },
    ],
  },
  "background-remover": {
    slug: "background-remover",
    fields: [
      { name: "tolerance", label: "Edge Precision Tolerance (10-80)", type: "number", defaultValue: 35, placeholder: "35" },
    ],
  },
  "background-changer": {
    slug: "background-changer",
    fields: [
      { name: "bgColor", label: "Backdrop Color", type: "select", options: ["Studio White", "Midnight Slate", "Clean Gray", "Cyberpunk Blue", "Luxury Emerald"], defaultValue: "Studio White" },
      { name: "tolerance", label: "Cutout Tolerance", type: "number", defaultValue: 35, placeholder: "35" },
    ],
  },
  "add-text-to-image": {
    slug: "add-text-to-image",
    fields: [
      { name: "text", label: "Overlay Text", type: "text", placeholder: "e.g. Korevante Studio 2026" },
      { name: "position", label: "Text Position", type: "select", options: ["Bottom", "Center", "Top"], defaultValue: "Bottom" },
      { name: "color", label: "Text Color", type: "select", options: ["White", "Yellow", "Cyan", "Black"], defaultValue: "White" },
      { name: "fontSize", label: "Font Size (px)", type: "number", defaultValue: 48, placeholder: "48" },
    ],
  },
  "passport-photo-maker": {
    slug: "passport-photo-maker",
    fields: [
      { name: "country", label: "Standard Preset", type: "select", options: ["USA / Global (2x2 inch, 600x600)", "Schengen / India (35x45 mm)"], defaultValue: "USA / Global (2x2 inch, 600x600)" },
    ],
  },
  "collage-maker": {
    slug: "collage-maker",
    allowMultipleFiles: true,
    fields: [
      { name: "layout", label: "Layout Format", type: "select", options: ["Side-by-Side (Horizontal)", "Stacked (Vertical)", "Grid 2x2"], defaultValue: "Side-by-Side (Horizontal)" },
    ],
  },
  "image-watermark-studio": {
    slug: "image-watermark-studio",
    fields: [
      { name: "text", label: "Watermark Text / Brand", type: "text", defaultValue: "© KOREVANTE STUDIO", placeholder: "e.g. © 2026 CONFIDENTIAL" },
      { name: "style", label: "Watermark Style", type: "select", options: ["Diagonal Tiled (Full Coverage)", "Subtle Bottom Right", "Prominent Center Stamp"], defaultValue: "Diagonal Tiled (Full Coverage)" },
      { name: "opacity", label: "Opacity Level", type: "select", options: ["Light (15%)", "Medium (30%)", "Solid (60%)"], defaultValue: "Medium (30%)" },
      { name: "color", label: "Watermark Color", type: "select", options: ["White", "Black", "Red", "Cyan"], defaultValue: "White" },
    ],
  },
  "watermark-remover": {
    slug: "watermark-remover",
    fields: [
      {
        name: "region",
        label: "Watermark Location",
        type: "select",
        options: [
          "Bottom-Right Corner",
          "Bottom-Left Corner",
          "Top-Right Corner",
          "Top-Left Corner",
          "Center Stamp",
          "Full Image Multi-Area",
        ],
        defaultValue: "Bottom-Right Corner",
      },
      {
        name: "mode",
        label: "Inpainting Algorithm",
        type: "select",
        options: [
          "AI Bilateral Content Inpainting (Seamless)",
          "Median Pixel Synthesis (Sharp Edge Clean)",
          "High-Frequency Texture Neutralizer",
        ],
        defaultValue: "AI Bilateral Content Inpainting (Seamless)",
      },
      {
        name: "intensity",
        label: "Clean Intensity (1-100)",
        type: "number",
        defaultValue: 80,
        placeholder: "80",
      },
    ],
  },
};

