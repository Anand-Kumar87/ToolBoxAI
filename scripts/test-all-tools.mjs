import sharp from "sharp";
import { PDFDocument, degrees } from "pdf-lib";

console.log("==================================================");
console.log("🚀 HACKER-STYLE COMPREHENSIVE TOOLS AUDIT & SUITE");
console.log("==================================================");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// -----------------------------------------------------------------
// 1. AI Content Generation Engine (Gemini 2.5 Flash Live Test)
// -----------------------------------------------------------------
async function testAiEngine() {
  console.log("\n[1/5] Testing AI Generation Engine...");
  const apiKey = process.env.GEMINI_API_KEY;
  assert(Boolean(apiKey), "GEMINI_API_KEY is configured");

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Write 2 catchy Instagram captions for a fitness brand with hashtags." }] }]
      })
    });
    assert(res.status === 200, `Gemini 2.5 Flash API returned status 200 (Got ${res.status})`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    assert(Boolean(text && text.length > 20), "Generated content received and non-empty");
  } catch (e) {
    assert(false, `Gemini API exception: ${e.message}`);
  }
}

// -----------------------------------------------------------------
// 2. AI Image Generator Engine
// -----------------------------------------------------------------
async function testAiImageGen() {
  console.log("\n[2/5] Testing AI Image Generator Engine...");
  try {
    const prompt = encodeURIComponent("hyper-realistic cybernetic robot cat, neon, 8k");
    const res = await fetch(`https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&nologo=true`);
    assert(res.status === 200, `Pollinations AI returned HTTP 200 (Got ${res.status})`);
    const buf = await res.arrayBuffer();
    assert(buf.byteLength > 1000, `Valid binary image payload received (${Math.round(buf.byteLength / 1024)} KB)`);
  } catch (e) {
    assert(false, `AI Image Generator exception: ${e.message}`);
  }
}

// -----------------------------------------------------------------
// 3. Image Studio Engine (Sharp Native Transformations)
// -----------------------------------------------------------------
async function testImageEngine() {
  console.log("\n[3/5] Testing Sharp Image Studio Transformations...");
  try {
    // Generate a test 200x200 sample image
    const sampleBuffer = await sharp({
      create: { width: 200, height: 200, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 1 } }
    }).png().toBuffer();

    // Test Resize
    const resized = await sharp(sampleBuffer).resize(400, 400).toBuffer();
    const metaResized = await sharp(resized).metadata();
    assert(metaResized.width === 400 && metaResized.height === 400, "Image Resizer works (400x400)");

    // Test 2x Upscaler with Lanczos3
    const upscaled = await sharp(sampleBuffer).resize(400, 400, { kernel: "lanczos3" }).sharpen().toBuffer();
    assert(upscaled.byteLength > 0, "AI Image Upscaler (Lanczos3 + Sharpening) works");

    // Test Format Converter (to WebP)
    const webpBuf = await sharp(sampleBuffer).webp({ quality: 80 }).toBuffer();
    const metaWebp = await sharp(webpBuf).metadata();
    assert(metaWebp.format === "webp", "Image Format Converter (WebP) works");

    // Test Filter (Grayscale)
    const grayBuf = await sharp(sampleBuffer).grayscale().toBuffer();
    assert(grayBuf.byteLength > 0, "Cinematic Image Filter (Grayscale) works");

    // Test SVG Text Overlay (Add Text to Image)
    const svg = `<svg width="200" height="200"><text x="100" y="100" font-size="20" fill="white">TEST</text></svg>`;
    const textOverlay = await sharp(sampleBuffer).composite([{ input: Buffer.from(svg) }]).toBuffer();
    assert(textOverlay.byteLength > 0, "Add Text & Typography to Image works");
  } catch (e) {
    assert(false, `Sharp image engine exception: ${e.message}`);
  }
}

// -----------------------------------------------------------------
// 4. PDF Studio Engine (PDF-Lib Native Transformations)
// -----------------------------------------------------------------
async function testPdfEngine() {
  console.log("\n[4/5] Testing PDF Studio Engine...");
  try {
    // Create Doc 1
    const doc1 = await PDFDocument.create();
    const page1 = doc1.addPage([400, 400]);
    page1.drawText("Page 1 of Document 1");
    const bytes1 = await doc1.save();

    // Create Doc 2
    const doc2 = await PDFDocument.create();
    const page2 = doc2.addPage([400, 400]);
    page2.drawText("Page 2 of Document 2");
    const bytes2 = await doc2.save();

    // Test PDF Merge
    const merged = await PDFDocument.create();
    const d1 = await PDFDocument.load(bytes1);
    const d2 = await PDFDocument.load(bytes2);
    const pagesA = await merged.copyPages(d1, d1.getPageIndices());
    const pagesB = await merged.copyPages(d2, d2.getPageIndices());
    pagesA.forEach(p => merged.addPage(p));
    pagesB.forEach(p => merged.addPage(p));
    assert(merged.getPageCount() === 2, "PDF Merge works (combined to 2 pages)");

    // Test PDF Rotate
    const rotDoc = await PDFDocument.load(bytes1);
    rotDoc.getPages()[0].setRotation(degrees(90));
    assert(rotDoc.getPages()[0].getRotation().angle === 90, "PDF Rotate works (90 degrees)");

    // Test PDF Compress
    const compDoc = await PDFDocument.create();
    const cPages = await compDoc.copyPages(d1, d1.getPageIndices());
    cPages.forEach(p => compDoc.addPage(p));
    const compBytes = await compDoc.save({ useObjectStreams: true });
    assert(compBytes.byteLength > 0, "PDF Compress with Object Streams works");
  } catch (e) {
    assert(false, `PDF engine exception: ${e.message}`);
  }
}

// -----------------------------------------------------------------
// 5. Safe Network & Public Domain Research (Cloudflare DoH)
// -----------------------------------------------------------------
async function testNetworkEngine() {
  console.log("\n[5/5] Testing Safe Network & Domain Lookup Engine...");
  try {
    const res = await fetch("https://cloudflare-dns.com/dns-query?name=google.com&type=A", {
      headers: { Accept: "application/dns-json" }
    });
    assert(res.status === 200, "Cloudflare DNS-over-HTTPS reachable (200 OK)");
    const data = await res.json();
    assert(Array.isArray(data.Answer) && data.Answer.length > 0, `DNS A records resolved successfully (${data.Answer[0].data})`);
  } catch (e) {
    assert(false, `Network engine exception: ${e.message}`);
  }
}

// Run All
async function main() {
  await testAiEngine();
  await testAiImageGen();
  await testImageEngine();
  await testPdfEngine();
  await testNetworkEngine();

  console.log("\n==================================================");
  console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");
  if (failed > 0) process.exit(1);
}

main();
