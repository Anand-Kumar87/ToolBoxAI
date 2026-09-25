import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// We can't use date-fns here, implement inline
function addDaysInline(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── 1. SEED PLANS ───────────────────────────────────────────────
  console.log("📦 Seeding subscription plans...");

  const basicPlan = await prisma.plan.upsert({
    where: { name: "BASIC" },
    update: {
      title: "Starter",
      price: 150,
      description: "Essential toolkit for students, hobbyists, and casual users."
    },
    create: {
      name: "BASIC",
      title: "Starter",
      description: "Essential toolkit for students, hobbyists, and casual users.",
      price: 150,
      currency: "INR",
      billingInterval: "monthly",
      aiRequestLimit: 20,
      fileUploadLimit: 15, // MB
      videoProcessLimit: 5, // minutes
      storageLimitMb: 500,
      features: JSON.stringify([
        "20+ Essential Tools",
        "20 AI Requests / day",
        "15 MB Max File Size",
        "720p Video Export",
        "Community Support",
      ]),
      isActive: true,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { name: "PRO" },
    update: {
      title: "Pro Creator",
      price: 450,
      description: "Designed for creators, freelancers, and growing builders."
    },
    create: {
      name: "PRO",
      title: "Pro Creator",
      description: "Designed for creators, freelancers, and growing builders.",
      price: 450,
      currency: "INR",
      billingInterval: "monthly",
      aiRequestLimit: 100,
      fileUploadLimit: 75,
      videoProcessLimit: 20,
      storageLimitMb: 5000,
      features: JSON.stringify([
        "All 50+ Premium Tools",
        "Unlimited AI Generation",
        "75 MB Max File Size",
        "1080p 60fps Video Export",
        "Priority Background Processing",
        "Commercial Usage Rights",
      ]),
      isActive: true,
    },
  });

  const premiumPlan = await prisma.plan.upsert({
    where: { name: "PREMIUM" },
    update: {
      title: "Enterprise",
      price: 1200,
      description: "Uncapped power with full studio capabilities and maximum throughput."
    },
    create: {
      name: "PREMIUM",
      title: "Enterprise",
      description: "Uncapped power with full studio capabilities and maximum throughput.",
      price: 1200,
      currency: "INR",
      billingInterval: "monthly",
      aiRequestLimit: 500,
      fileUploadLimit: 250,
      videoProcessLimit: 60,
      storageLimitMb: 25000,
      features: JSON.stringify([
        "Everything in Pro",
        "4K Video Transcoding",
        "Custom API Access (10k req/mo)",
        "25 GB Dedicated Cloud Vault",
        "Dedicated VIP Account Manager",
        "Custom SLA & 99.9% Uptime",
      ]),
      isActive: true,
    },
  });

  console.log(`   ✅ Plans seeded: Starter (₹150), Pro Creator (₹450), Enterprise (₹1,200)`);

  // ─── 2. SEED TOOLS ───────────────────────────────────────────────
  console.log("🔧 Seeding tools registry...");

  const toolsData = [
    // AI Content Tools
    { slug: "ai-content-writer", name: "AI Content Writer", description: "Generate structured, engaging content by specifying topic, tone, length, and audience.", category: "AI" as const, planRequired: "BASIC" , icon: "PenTool", isFeatured: true },
    { slug: "blog-generator", name: "Blog Post Generator", description: "Turn keywords and topics into outline-structured blog posts.", category: "AI" as const, planRequired: "BASIC" , icon: "BookOpen", isFeatured: true },
    { slug: "article-writer", name: "Long-form Article Writer", description: "Craft thorough, research-oriented articles with headings and conclusion.", category: "AI" as const, planRequired: "PRO" , icon: "FileText" },
    { slug: "product-description-generator", name: "Product Description Generator", description: "High-converting eCommerce product copy highlighting features and benefits.", category: "AI" as const, planRequired: "BASIC" , icon: "ShoppingBag" },
    { slug: "email-writer", name: "Professional Email Writer", description: "Generate sales pitches, support replies, and professional follow-ups.", category: "AI" as const, planRequired: "BASIC" , icon: "Mail" },
    { slug: "social-media-captions", name: "Social Media Caption Generator", description: "Catchy captions with hashtags for Instagram, LinkedIn, X, and Facebook.", category: "AI" as const, planRequired: "BASIC" , icon: "Share2" },
    { slug: "youtube-title-generator", name: "YouTube Title Generator", description: "High-CTR viral YouTube video title suggestions.", category: "AI" as const, planRequired: "BASIC" , icon: "PlaySquare" },
    { slug: "youtube-description-generator", name: "YouTube Description & Tags", description: "Complete YouTube video descriptions with timestamps, CTAs, and hashtags.", category: "AI" as const, planRequired: "BASIC" , icon: "Video" },
    { slug: "seo-keyword-generator", name: "SEO Keyword Generator", description: "Generate targeted semantic keyword ideas for your niche.", category: "AI" as const, planRequired: "PRO" , icon: "Key" },
    { slug: "grammar-checker", name: "Grammar & Spell Checker", description: "Detect grammatical errors and get contextual sentence improvements.", category: "AI" as const, planRequired: "BASIC" , icon: "CheckCircle" },
    { slug: "text-summarizer", name: "Smart Text Summarizer", description: "Condense long texts into short, medium, or detailed bullet summaries.", category: "AI" as const, planRequired: "BASIC" , icon: "AlignLeft" },
    { slug: "paraphraser", name: "Text Paraphraser", description: "Rewrite sentences across formal, casual, simple, or creative tones.", category: "AI" as const, planRequired: "BASIC" , icon: "Repeat" },
    { slug: "translator", name: "Multi-Language Translator", description: "Accurate translations across 50+ international languages.", category: "AI" as const, planRequired: "BASIC" , icon: "Languages" },
    { slug: "script-writer", name: "Video & Shorts Script Writer", description: "Full scene-by-scene video scripts with hook, body, and CTA.", category: "AI" as const, planRequired: "PRO" , icon: "Clapperboard" },
    { slug: "resume-generator", name: "AI Resume Generator", description: "Transform work history into polished, ATS-optimized resume content.", category: "AI" as const, planRequired: "PRO" , icon: "FileUser" },
    // Image Tools
    { slug: "background-remover", name: "AI Background Remover", description: "Isolate subjects with clean transparent PNG output.", category: "IMAGE" as const, planRequired: "PRO" , icon: "Scissors", isFeatured: true },
    { slug: "background-changer", name: "Background Changer", description: "Replace image background with colors, backdrops, or custom uploads.", category: "IMAGE" as const, planRequired: "PRO" , icon: "Palette" },
    { slug: "image-resizer", name: "Image Resizer & Social Presets", description: "Resize to custom dimensions or social media presets.", category: "IMAGE" as const, planRequired: "BASIC" , icon: "Scaling" },
    { slug: "image-compressor", name: "Lossless Image Compressor", description: "Reduce file sizes while preserving sharp visual fidelity.", category: "IMAGE" as const, planRequired: "BASIC" , icon: "Minimize2" },
    { slug: "image-converter", name: "Image Format Converter", description: "Convert between PNG, JPG, and high-efficiency WEBP formats.", category: "IMAGE" as const, planRequired: "BASIC" , icon: "RefreshCw" },
    { slug: "image-cropper", name: "Precision Image Cropper", description: "Crop with aspect ratios: Freeform, 1:1, 16:9, 9:16, 4:3.", category: "IMAGE" as const, planRequired: "BASIC" , icon: "Crop" },
    { slug: "image-upscaler", name: "AI Image Upscaler (2x / 4x)", description: "Upscale low-resolution photos using deep neural networks.", category: "IMAGE" as const, planRequired: "PRO" , icon: "ZoomIn", isFeatured: true },
    { slug: "image-enhancer", name: "Photo Enhancer", description: "Fine-tune brightness, contrast, saturation, and sharpness.", category: "IMAGE" as const, planRequired: "BASIC" , icon: "Sliders" },
    { slug: "image-blur-tool", name: "Image Blur Tool", description: "Apply gaussian blur with customizable intensity.", category: "IMAGE" as const, planRequired: "BASIC" , icon: "Sparkle" },
    { slug: "image-sharpener", name: "Image Sharpener", description: "Enhance edge clarity and recover crisp details.", category: "IMAGE" as const, planRequired: "BASIC" , icon: "Eye" },
    { slug: "add-text-to-image", name: "Add Text to Image", description: "Overlay custom text with fonts, sizing, rotation, and alignment.", category: "IMAGE" as const, planRequired: "BASIC" , icon: "Type" },
    { slug: "image-filters", name: "Cinematic Image Filters", description: "Apply presets: Vintage, B&W, Warm Sun, Cool Cyan, High Contrast.", category: "IMAGE" as const, planRequired: "BASIC" , icon: "Film" },
    { slug: "passport-photo-maker", name: "Passport Photo Creator", description: "Crop and scale photos to standard passport specifications.", category: "IMAGE" as const, planRequired: "BASIC" , icon: "UserSquare2" },
    { slug: "collage-maker", name: "Grid Collage Maker", description: "Combine multiple photos into neat grid layouts.", category: "IMAGE" as const, planRequired: "BASIC" , icon: "LayoutGrid" },
    { slug: "ai-image-generator", name: "AI Image Generator", description: "Generate photorealistic artwork from text prompts.", category: "AI" as const, planRequired: "PREMIUM" , icon: "Wand2", isFeatured: true },
    // Video Tools
    { slug: "video-compressor", name: "Video Compressor", description: "Shrink video file sizes while retaining crystal clear quality.", category: "VIDEO" as const, planRequired: "PRO" , icon: "FileArchive", isFeatured: true },
    { slug: "video-converter", name: "Video Format Converter", description: "Convert video files between MP4, WebM, MOV, and AVI.", category: "VIDEO" as const, planRequired: "PRO" , icon: "RefreshCw" },
    { slug: "video-trimmer", name: "Video Trimmer & Cutter", description: "Set precise start and end times to cut video segments.", category: "VIDEO" as const, planRequired: "BASIC" , icon: "Scissors" },
    { slug: "video-cropper", name: "Video Cropper & Aspect Ratio", description: "Crop videos to 1:1, 16:9, 9:16, and 4:3 dimensions.", category: "VIDEO" as const, planRequired: "PRO" , icon: "Crop" },
    { slug: "video-merger", name: "Video Stitcher & Merger", description: "Combine multiple video clips into a single continuous video.", category: "VIDEO" as const, planRequired: "PRO" , icon: "Layers" },
    { slug: "video-to-gif", name: "Video to Animated GIF", description: "Transform video clips into lightweight animated GIF stickers.", category: "VIDEO" as const, planRequired: "BASIC" , icon: "ImagePlay" },
    { slug: "gif-to-video", name: "GIF to MP4 Video Converter", description: "Convert looping GIFs into smooth MP4 video format.", category: "VIDEO" as const, planRequired: "BASIC" , icon: "Video" },
    { slug: "extract-audio", name: "Extract Audio (MP3 / WAV)", description: "Rip clean audio tracks from video files.", category: "VIDEO" as const, planRequired: "BASIC" , icon: "Music" },
    { slug: "add-subtitles", name: "Hardcode & Burn Subtitles", description: "Embed SRT or VTT subtitles directly into video files.", category: "VIDEO" as const, planRequired: "PRO" , icon: "Subtitles" },
    { slug: "video-speed-controller", name: "Video Speed Controller", description: "Accelerate or slow down video footage (0.5x to 2x).", category: "VIDEO" as const, planRequired: "BASIC" , icon: "FastForward" },
    { slug: "mute-video", name: "Video Audio Muter", description: "Strip and remove the audio track from any video file.", category: "VIDEO" as const, planRequired: "BASIC" , icon: "VolumeX" },
    { slug: "video-resolution-converter", name: "Video Resolution Converter", description: "Transcode videos to 480p, 720p, and 1080p.", category: "VIDEO" as const, planRequired: "PRO" , icon: "Tv" },
    // PDF Tools
    { slug: "pdf-merge", name: "Merge PDF Files", description: "Combine multiple PDF documents into one organized file.", category: "PDF" as const, planRequired: "BASIC" , icon: "FilePlus", isFeatured: true },
    { slug: "pdf-split", name: "Split & Extract PDF", description: "Split PDFs into separate documents or extract page intervals.", category: "PDF" as const, planRequired: "BASIC" , icon: "FileMinus" },
    { slug: "pdf-compress", name: "Compress & Optimize PDF", description: "Reduce PDF size for easy emailing with maintained quality.", category: "PDF" as const, planRequired: "BASIC" , icon: "FileArchive" },
    { slug: "image-to-pdf", name: "Images to PDF Converter", description: "Convert JPG, PNG, WEBP photos into a multi-page PDF.", category: "PDF" as const, planRequired: "BASIC" , icon: "FileImage" },
    { slug: "pdf-to-image", name: "PDF to High-Res Images", description: "Export PDF pages as high-resolution PNG or JPG images.", category: "PDF" as const, planRequired: "BASIC" , icon: "FileDown" },
    { slug: "pdf-text-extractor", name: "Extract Text from PDF", description: "Extract raw or structured text content from PDF pages.", category: "PDF" as const, planRequired: "BASIC" , icon: "FileSearch" },
    { slug: "pdf-rotate", name: "Rotate PDF Pages", description: "Rotate pages clockwise or counter-clockwise (90°, 180°, 270°).", category: "PDF" as const, planRequired: "BASIC" , icon: "RotateCw" },
    { slug: "pdf-page-reorder", name: "Reorder PDF Pages", description: "Drag-and-drop visual page ordering and deletion.", category: "PDF" as const, planRequired: "BASIC" , icon: "ArrowUpDown" },
    { slug: "pdf-form-filling", name: "Fill PDF Forms", description: "Input and save data into fillable PDF form fields.", category: "PDF" as const, planRequired: "PRO" , icon: "FileCheck" },
    { slug: "pdf-metadata-viewer", name: "PDF Metadata Inspector", description: "Inspect title, author, creation date, and PDF version.", category: "PDF" as const, planRequired: "BASIC" , icon: "Info" },
    // Developer Tools
    { slug: "json-formatter", name: "JSON Formatter & Validator", description: "Parse, format, validate, and minify complex JSON objects.", category: "DEVELOPER" as const, planRequired: "BASIC" , icon: "Code" },
    { slug: "base64-tool", name: "Base64 Encoder / Decoder", description: "Encode strings and binary files to Base64 and decode back.", category: "DEVELOPER" as const, planRequired: "BASIC" , icon: "Binary" },
    { slug: "url-encoder", name: "URL Encoder & Decoder", description: "Safely encode and decode URI components and query strings.", category: "DEVELOPER" as const, planRequired: "BASIC" , icon: "Link" },
    { slug: "password-generator", name: "Secure Password Generator", description: "Generate cryptographically secure random passwords.", category: "DEVELOPER" as const, planRequired: "BASIC" , icon: "ShieldAlert" },
    // Productivity Tools
    { slug: "qr-code-generator", name: "Custom QR Code Generator", description: "Generate QR codes for URLs, text, WiFi, and contact cards.", category: "PRODUCTIVITY" as const, planRequired: "BASIC" , icon: "QrCode" },
    { slug: "qr-code-scanner", name: "QR Code Image Scanner", description: "Upload an image to decode and read QR code data.", category: "PRODUCTIVITY" as const, planRequired: "BASIC" , icon: "Scan" },
    { slug: "unit-converter", name: "Multi-Category Unit Converter", description: "Convert Length, Weight, Temperature, Speed, and Storage units.", category: "PRODUCTIVITY" as const, planRequired: "BASIC" , icon: "ArrowLeftRight" },
    { slug: "color-picker", name: "Color Converter & Palette Studio", description: "Convert between HEX, RGB, HSL and analyze color contrast.", category: "PRODUCTIVITY" as const, planRequired: "BASIC" , icon: "Pipette" },
    { slug: "text-case-converter", name: "Text Case Converter", description: "Convert text to UPPERCASE, lowercase, Title Case, camelCase, snake_case.", category: "PRODUCTIVITY" as const, planRequired: "BASIC" , icon: "CaseSensitive" },
    { slug: "safe-public-research", name: "Public Domain & Network Research", description: "Privacy-respecting lookup for domain DNS records and website metadata.", category: "UTILITIES" as const, planRequired: "PRO" , icon: "Globe" },
  ];

  for (const tool of toolsData) {
    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: { name: tool.name, description: tool.description },
      create: { ...tool, isFeatured: tool.isFeatured ?? false },
    });
  }

  console.log(`   ✅ Seeded ${toolsData.length} tools`);

  // ─── 3. SEED ADMIN USER ───────────────────────────────────────────
  console.log("👤 Seeding admin user...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@toolverse.ai";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@Toolverse2024!";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "ToolVerse Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
      profile: {
        create: {
          bio: "Platform Administrator",
          avatarUrl: null,
          theme: "dark",
        },
      },
      trial: {
        create: {
          trialStartDate: new Date(),
          trialEndDate: addDaysInline(new Date(), 365),
          trialStatus: "ACTIVE",
        },
      },
    },
  });

  // Give admin an active Premium subscription
  const existingAdminSub = await prisma.subscription.findFirst({
    where: { userId: adminUser.id, status: "ACTIVE" },
  });

  if (!existingAdminSub) {
    await prisma.subscription.create({
      data: {
        userId: adminUser.id,
        planId: premiumPlan.id,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: addDaysInline(new Date(), 365),
      },
    });
  }

  console.log(`   ✅ Admin user seeded: ${adminEmail}`);
  console.log(`   ℹ️  Admin password: ${adminPassword} (change in production!)`);

  console.log("\n✅ Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
