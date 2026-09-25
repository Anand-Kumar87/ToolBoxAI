export type PdfFieldType = "number" | "select" | "text" | "file";

export interface PdfFieldDef {
  name: string;
  label: string;
  type: PdfFieldType;
  placeholder?: string;
  options?: string[];
  defaultValue?: string | number;
}

export interface PdfToolConfig {
  slug: string;
  fields: PdfFieldDef[];
  allowMultipleFiles?: boolean;
}

export const PDF_TOOLS_CONFIG: Record<string, PdfToolConfig> = {
  "pdf-merge": {
    slug: "pdf-merge",
    allowMultipleFiles: true,
    fields: [],
  },
  "pdf-split": {
    slug: "pdf-split",
    fields: [
      { name: "pages", label: "Pages to Extract (e.g. 1-3, 5)", type: "text", placeholder: "1, 2, 4-6" },
    ],
  },
  "pdf-rotate": {
    slug: "pdf-rotate",
    fields: [
      { name: "degrees", label: "Rotation", type: "select", options: ["90", "180", "270"], defaultValue: "90" },
    ],
  },
  "image-to-pdf": {
    slug: "image-to-pdf",
    allowMultipleFiles: true,
    fields: [],
  },
  "pdf-metadata-viewer": {
    slug: "pdf-metadata-viewer",
    fields: [],
  },
  "pdf-compress": {
    slug: "pdf-compress",
    fields: [
      { name: "level", label: "Compression Level", type: "select", options: ["Standard (Balanced)", "Maximum Compression (Emails)", "Lossless Archive"], defaultValue: "Standard (Balanced)" },
    ],
  },
  "pdf-page-reorder": {
    slug: "pdf-page-reorder",
    fields: [
      { name: "pageOrder", label: "New Page Order (e.g. 3, 1, 2)", type: "text", placeholder: "e.g. 3, 1, 2" },
    ],
  },
  "pdf-text-extractor": {
    slug: "pdf-text-extractor",
    fields: [],
  },
  "pdf-form-filling": {
    slug: "pdf-form-filling",
    fields: [
      { name: "fieldName", label: "Form Field Name", type: "text", placeholder: "e.g. FullName, Date, Signature" },
      { name: "fieldValue", label: "Field Value to Enter", type: "text", placeholder: "e.g. John Doe, 2026-09-24" },
    ],
  },
  "pdf-to-image": {
    slug: "pdf-to-image",
    fields: [
      { name: "format", label: "Target Image Format", type: "select", options: ["PNG", "JPEG"], defaultValue: "PNG" },
    ],
  },
  "pdf-watermark-stamp": {
    slug: "pdf-watermark-stamp",
    fields: [
      { name: "stampText", label: "Stamp / Watermark Text", type: "text", defaultValue: "CONFIDENTIAL", placeholder: "e.g. CONFIDENTIAL, DRAFT, DO NOT COPY" },
      { name: "color", label: "Stamp Color", type: "select", options: ["Red Alert", "Slate Gray", "Navy Blue"], defaultValue: "Red Alert" },
      { name: "opacity", label: "Opacity", type: "select", options: ["Light (25%)", "Medium (50%)", "Solid (75%)"], defaultValue: "Light (25%)" },
    ],
  },
  "pdf-password-protect": {
    slug: "pdf-password-protect",
    fields: [
      { name: "password", label: "Protection Password", type: "text", placeholder: "Enter a strong password to lock the document" },
    ],
  },
  "pdf-unlocker": {
    slug: "pdf-unlocker",
    fields: [
      {
        name: "password",
        label: "Document Password (Optional if permission-locked)",
        type: "text",
        placeholder: "Enter password if user-encrypted, or leave blank for permission lock",
      },
    ],
  },
};

