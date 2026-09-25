export type AIFieldType = "text" | "textarea" | "select";

export interface AIFieldDef {
  name: string;
  label: string;
  type: AIFieldType;
  placeholder?: string;
  options?: string[]; // for select
  required?: boolean;
}

export interface AIToolConfig {
  slug: string;
  fields: AIFieldDef[];
  generatePrompt: (data: Record<string, string>) => string;
}

export const AI_TOOLS_CONFIG: Record<string, AIToolConfig> = {
  "ai-content-writer": {
    slug: "ai-content-writer",
    fields: [
      { name: "topic", label: "Topic", type: "text", required: true, placeholder: "e.g., The Future of Artificial Intelligence" },
      { name: "audience", label: "Target Audience", type: "text", required: true, placeholder: "e.g., Tech Enthusiasts" },
      { name: "tone", label: "Tone", type: "select", options: ["Professional", "Casual", "Humorous", "Persuasive", "Inspirational"] },
      { name: "length", label: "Length", type: "select", options: ["Short", "Medium", "Long"] },
    ],
    generatePrompt: (d) => `Write a ${d.length.toLowerCase()} piece of content about "${d.topic}". Target audience: ${d.audience}. Tone: ${d.tone}. Structure it with clear headings and paragraphs.`,
  },
  "blog-generator": {
    slug: "blog-generator",
    fields: [
      { name: "title", label: "Blog Title", type: "text", required: true, placeholder: "e.g., 5 Ways AI is Changing Healthcare" },
      { name: "keywords", label: "SEO Keywords", type: "text", placeholder: "e.g., AI, healthcare, machine learning" },
      { name: "tone", label: "Tone", type: "select", options: ["Informative", "Engaging", "Authoritative"] },
    ],
    generatePrompt: (d) => `Write a comprehensive, SEO-optimized blog post titled "${d.title}". Tone should be ${d.tone}. Ensure you naturally include these keywords: ${d.keywords}. Include an introduction, body paragraphs with H2 headings, and a conclusion.`,
  },
  "article-writer": {
    slug: "article-writer",
    fields: [
      { name: "topic", label: "Article Topic", type: "text", required: true },
      { name: "points", label: "Key Points to Cover", type: "textarea", placeholder: "List the main arguments..." },
      { name: "tone", label: "Tone", type: "select", options: ["Academic", "Journalistic", "Opinionated"] },
    ],
    generatePrompt: (d) => `Write a well-researched, long-form article about "${d.topic}". Tone: ${d.tone}. Make sure to cover the following key points in detail:\n${d.points}\n\nFormat with appropriate headings.`,
  },
  "product-description-generator": {
    slug: "product-description-generator",
    fields: [
      { name: "product", label: "Product Name", type: "text", required: true },
      { name: "features", label: "Key Features", type: "textarea", required: true },
      { name: "audience", label: "Target Audience", type: "text" },
    ],
    generatePrompt: (d) => `Write a high-converting product description for "${d.product}". Target audience: ${d.audience}. Highlight the following features and their benefits:\n${d.features}\n\nInclude a strong call to action at the end.`,
  },
  "email-writer": {
    slug: "email-writer",
    fields: [
      { name: "recipient", label: "Recipient (Who are you emailing?)", type: "text", required: true },
      { name: "purpose", label: "Email Purpose", type: "textarea", required: true, placeholder: "e.g., Follow up after yesterday's meeting..." },
      { name: "tone", label: "Tone", type: "select", options: ["Professional", "Friendly", "Urgent", "Persuasive"] },
    ],
    generatePrompt: (d) => `Write an email to ${d.recipient}. Tone: ${d.tone}. The purpose of the email is:\n${d.purpose}\n\nKeep it clear, concise, and highly effective.`,
  },
  "social-media-captions": {
    slug: "social-media-captions",
    fields: [
      { name: "context", label: "What is the post about?", type: "textarea", required: true },
      { name: "platform", label: "Platform", type: "select", options: ["Instagram", "Twitter/X", "LinkedIn", "Facebook"] },
      { name: "tone", label: "Tone", type: "select", options: ["Engaging", "Professional", "Witty", "Inspirational"] },
    ],
    generatePrompt: (d) => `Generate 3 catchy social media captions for ${d.platform} about:\n${d.context}\n\nTone: ${d.tone}. Include relevant hashtags and emojis.`,
  },
  "youtube-title-generator": {
    slug: "youtube-title-generator",
    fields: [
      { name: "topic", label: "Video Topic / Concept", type: "text", required: true },
      { name: "keywords", label: "Target Keywords", type: "text" },
    ],
    generatePrompt: (d) => `Generate 10 highly clickable, high-CTR YouTube video titles about "${d.topic}". Include these keywords naturally if possible: ${d.keywords}. Use psychology and curiosity without being clickbait.`,
  },
  "youtube-description-generator": {
    slug: "youtube-description-generator",
    fields: [
      { name: "title", label: "Video Title", type: "text", required: true },
      { name: "summary", label: "Video Summary", type: "textarea", required: true },
      { name: "links", label: "Links to Include", type: "textarea", placeholder: "e.g., Social links, website..." },
    ],
    generatePrompt: (d) => `Write a complete, SEO-optimized YouTube video description for a video titled "${d.title}". Summary of the video:\n${d.summary}\n\nInclude a section for timestamps, these links: ${d.links}, and a list of 15 relevant tags/hashtags at the bottom.`,
  },
  "seo-keyword-generator": {
    slug: "seo-keyword-generator",
    fields: [
      { name: "niche", label: "Niche / Topic", type: "text", required: true },
    ],
    generatePrompt: (d) => `Generate a comprehensive list of 30 SEO keywords for the niche: "${d.niche}". Group them into categories: Short-tail, Long-tail, and LSI keywords. Provide search intent (Informational, Navigational, Transactional) for each.`,
  },
  "grammar-checker": {
    slug: "grammar-checker",
    fields: [
      { name: "text", label: "Text to check", type: "textarea", required: true },
    ],
    generatePrompt: (d) => `Please proofread and correct the grammatical errors, spelling typos, and punctuation in the following text. Then, provide the corrected text, followed by a brief explanation of the changes made:\n\n${d.text}`,
  },
  "text-summarizer": {
    slug: "text-summarizer",
    fields: [
      { name: "text", label: "Text to summarize", type: "textarea", required: true },
      { name: "format", label: "Summary Format", type: "select", options: ["Bullet Points", "Short Paragraph", "Detailed Output"] },
    ],
    generatePrompt: (d) => `Summarize the following text in the format of ${d.format}:\n\n${d.text}`,
  },
  "paraphraser": {
    slug: "paraphraser",
    fields: [
      { name: "text", label: "Text to paraphrase", type: "textarea", required: true },
      { name: "tone", label: "Target Tone", type: "select", options: ["Formal", "Casual", "Creative", "Simple"] },
    ],
    generatePrompt: (d) => `Paraphrase and rewrite the following text in a ${d.tone} tone. Improve the flow and vocabulary while retaining the original meaning:\n\n${d.text}`,
  },
  "translator": {
    slug: "translator",
    fields: [
      { name: "text", label: "Text to translate", type: "textarea", required: true },
      { name: "language", label: "Target Language", type: "text", required: true, placeholder: "e.g., Spanish, French, Japanese" },
    ],
    generatePrompt: (d) => `Translate the following text into natural, culturally nuanced ${d.language}. Provide the direct translation first, then list any cultural or contextual notes if applicable:\n\n${d.text}`,
  },
  "script-writer": {
    slug: "script-writer",
    fields: [
      { name: "topic", label: "Video Topic", type: "text", required: true },
      { name: "platform", label: "Platform", type: "select", options: ["YouTube Long-form", "TikTok / Shorts / Reels"] },
    ],
    generatePrompt: (d) => `Write a highly engaging, scene-by-scene script for a ${d.platform} video about "${d.topic}". Include visual cues [in brackets], an explosive hook in the first 3 seconds, a structured body, and a strong call to action at the end.`,
  },
  "resume-generator": {
    slug: "resume-generator",
    fields: [
      { name: "role", label: "Target Job Role", type: "text", required: true },
      { name: "history", label: "Raw Work History / Duties", type: "textarea", required: true },
    ],
    generatePrompt: (d) => `I am applying for the role of "${d.role}". Rewrite my raw work history into 5-7 highly professional, ATS-optimized resume bullet points. Use strong action verbs and focus on achievements and metrics.\n\nRaw history:\n${d.history}`,
  },
  "ai-image-generator": {
    slug: "ai-image-generator",
    fields: [
      { name: "prompt", label: "Image Description / Prompt", type: "textarea", required: true, placeholder: "e.g. A hyper-realistic cyberpunk city at twilight with neon lights, volumetric rain, 8k resolution" },
      { name: "style", label: "Visual Style", type: "select", options: ["Photorealistic", "Digital Art", "Cyberpunk", "Anime / Manga", "Cinematic 3D", "Vintage Oil Painting"] },
      { name: "aspectRatio", label: "Aspect Ratio", type: "select", options: ["1:1 Square (1024x1024)", "16:9 Landscape (1280x720)", "9:16 Portrait (720x1280)"] },
    ],
    generatePrompt: (d) => `${d.prompt}, ${d.style} aesthetic, high detail, masterpiece, studio lighting, 8k resolution`,
  },
  "ai-code-auditor": {
    slug: "ai-code-auditor",
    fields: [
      { name: "language", label: "Programming Language", type: "select", options: ["TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "C++", "SQL", "PHP", "HTML/CSS"] },
      { name: "focus", label: "Audit & Analysis Focus", type: "select", options: ["Security & Vulnerabilities (CVE, OWASP)", "Performance & Memory Leak Optimization", "Clean Architecture & Refactoring", "Comprehensive Bug Detection & Fix"] },
      { name: "code", label: "Source Code to Audit", type: "textarea", required: true, placeholder: "Paste your code snippet here..." },
    ],
    generatePrompt: (d) => `Act as a Principal Staff Software Engineer and Senior Cybersecurity Auditor. Conduct a deep code inspection of the following ${d.language} code.\nFocus: ${d.focus}.\n\nSource Code:\n\`\`\`${d.language.toLowerCase()}\n${d.code}\n\`\`\`\n\nProvide your analysis structured as:\n1. 🔍 Vulnerability & Bug Breakdown\n2. ⚡ Performance & Scalability Critique\n3. 🛠️ Fully Refactored, Production-Ready Code\n4. 💡 Architecture & Security Recommendations`,
  },
  "ai-sql-builder": {
    slug: "ai-sql-builder",
    fields: [
      { name: "dialect", label: "Database Dialect", type: "select", options: ["PostgreSQL", "MySQL", "SQLite", "SQL Server (T-SQL)", "BigQuery", "Snowflake"] },
      { name: "request", label: "What data or metric do you need to calculate?", type: "textarea", required: true, placeholder: "e.g., Calculate month-over-month revenue growth per customer category with churn rate" },
      { name: "schema", label: "Table Schema or Column Names (Optional)", type: "textarea", placeholder: "e.g., users(id, created_at, plan), orders(id, user_id, amount, status, created_at)" },
    ],
    generatePrompt: (d) => `Act as a Senior Database Architect. Write an optimized ${d.dialect} query based on this business request:\n"${d.request}"\n\nDatabase Schema Context:\n${d.schema || "Infer standard normalized schema naming conventions."}\n\nProvide the clean SQL query, followed by indexing tips, execution plan hints, and an explanation of the analytical logic.`,
  },
  "ai-sales-pitch": {
    slug: "ai-sales-pitch",
    fields: [
      { name: "offering", label: "Product / Service Offering", type: "text", required: true, placeholder: "e.g. AI-powered workflow automation platform" },
      { name: "prospect", label: "Target Prospect Persona / Company", type: "text", required: true, placeholder: "e.g. VP of Operations at mid-market logistics firms" },
      { name: "format", label: "Outreach Asset Type", type: "select", options: ["3-Touch Cold Email Sequence", "LinkedIn Connection Note & InMail", "Objection Handling Battle Card", "Cold Call Opening Hook"] },
      { name: "painPoint", label: "Primary Pain Point Solved", type: "textarea", required: true, placeholder: "e.g. High manual data entry costs and slow order processing times" },
    ],
    generatePrompt: (d) => `You are a world-class B2B Sales Strategist. Craft a high-converting '${d.format}' asset for:\nProduct: ${d.offering}\nTarget Prospect: ${d.prospect}\nPain Points Addressed: ${d.painPoint}\n\nTone: Professional, high-empathy, value-first, non-pushy. Include strong subject lines and frictionless call-to-actions.`,
  },
  "ai-pitchdeck-generator": {
    slug: "ai-pitchdeck-generator",
    fields: [
      { name: "companyName", label: "Startup / Company Name", type: "text", required: true, placeholder: "e.g. NexusFlow AI" },
      { name: "industry", label: "Industry / Vertical", type: "text", required: true, placeholder: "e.g. B2B Developer Tools / Enterprise AI" },
      { name: "elevatorPitch", label: "One-line Elevator Pitch", type: "textarea", required: true, placeholder: "e.g. The automated observability pipeline for autonomous AI agent networks." },
      { name: "traction", label: "Current Traction & Metrics", type: "textarea", placeholder: "e.g. $45k MRR, 12 enterprise pilots, 350% QoQ growth, 2 pending patents" },
    ],
    generatePrompt: (d) => `Act as a Tier-1 Venture Capital Partner (Benchmark / Sequoia caliber). Generate a comprehensive 10-slide Investor Pitch Deck Outline and Executive Summary for '${d.companyName}' (${d.industry}).\n\nElevator Pitch: ${d.elevatorPitch}\nTraction: ${d.traction || "Early-stage pre-seed with working MVP and organic customer interest"}.\n\nOutline all 10 core slides in detail:\n1. The Hook / Vision\n2. The Unfair Problem\n3. The 10x Solution\n4. TAM / SAM / SOM Market Sizing\n5. Product Architecture & Moat\n6. Business Model & Unit Economics\n7. Go-To-Market Flywheel\n8. Traction & Milestones\n9. Competitive Matrix\n10. The Ask & Capital Allocation`,
  },
  "ai-voiceover-script": {
    slug: "ai-voiceover-script",
    fields: [
      { name: "title", label: "Script Title / Subject", type: "text", required: true, placeholder: "e.g. Launching the Future of Productivity" },
      { name: "format", label: "Audio Production Format", type: "select", options: ["YouTube 60-Second Commercial Ad", "Podcast Episode Intro & Teaser", "Explainer Video Voiceover (2 mins)", "Audiobook Chapter Narration"] },
      { name: "tone", label: "Vocal Delivery Tone", type: "select", options: ["Cinematic & Epic", "Warm & Conversational", "High Energy & Dynamic", "Calm & Authoritative"] },
      { name: "keyPoints", label: "Key Storyline / Message", type: "textarea", required: true, placeholder: "Outline the narrative arc and key message..." },
    ],
    generatePrompt: (d) => `You are a Hollywood scriptwriter and audio director. Write a studio-grade voiceover script for '${d.title}' in the format of '${d.format}'. Vocal delivery tone: ${d.tone}.\n\nNarrative & Key Points:\n${d.keyPoints}\n\nInclude explicit audio cues in brackets, e.g. [pause 1.5s], [whisper], [dramatic swell], [upbeat inflection], and provide phonetic pronunciation guides for any specialized terms.`,
  },
  "nano-banana-image-studio": {
    slug: "nano-banana-image-studio",
    fields: [
      { name: "prompt", label: "Image Prompt & Instructions", type: "textarea", required: true, placeholder: "Describe the image in detail, lighting, subject, atmosphere, and composition..." },
      { name: "negativePrompt", label: "Negative Prompt (What to exclude)", type: "text", placeholder: "e.g. Blurry, lowres, bad anatomy, deformed limbs, artifacts, text" },
      { name: "style", label: "Aesthetic & Engine Style", type: "select", options: ["Photorealistic 8K", "Cinematic Film 35mm", "Cyberpunk Neon", "3D Octane Render", "Anime Studio Masterpiece", "Vintage Oil Painting", "Minimalist Vector Art"] },
      { name: "aspectRatio", label: "Canvas Aspect Ratio", type: "select", options: ["1:1 Square (1024x1024)", "16:9 Cinematic (1280x720)", "9:16 Mobile Story (720x1280)", "4:3 Classic Photo (1024x768)", "21:9 Ultrawide Panorama (1344x576)"] },
    ],
    generatePrompt: (d) => `${d.prompt}, ${d.style} aesthetic, masterpiece, 8k resolution, volumetric studio lighting`,
  },
};



