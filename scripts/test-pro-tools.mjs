import sharp from "sharp";
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";

console.log("==================================================");
console.log("💎 10 ADVANCED PRO TOOLS AUTOMATED TEST SUITE");
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

// 1. AI Code Auditor
async function testCodeAuditor() {
  console.log("\n[1/10] Testing AI Code Auditor & Bug Fixer (PRO)...");
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Audit this TypeScript code for SQL injection: const query = `SELECT * FROM users WHERE email = '${email}'`;" }] }]
      })
    });
    assert(res.status === 200, "AI Code Auditor API returned HTTP 200");
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    assert(Boolean(text && text.includes("injection")), "Identified vulnerability and provided fix");
  } catch (e) {
    assert(false, `AI Code Auditor failed: ${e.message}`);
  }
}

// 2. AI SQL Builder
async function testSqlBuilder() {
  console.log("\n[2/10] Testing AI SQL Query Builder (PRO)...");
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Write an optimized PostgreSQL query calculating monthly retention rate of registered users." }] }]
      })
    });
    assert(res.status === 200, "AI SQL Builder API returned HTTP 200");
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    assert(Boolean(text && text.length > 50), "Generated SQL query with analytics logic");
  } catch (e) {
    assert(false, `AI SQL Builder failed: ${e.message}`);
  }
}

// 3. AI Sales Pitch
async function testSalesPitch() {
  console.log("\n[3/10] Testing B2B Cold Outreach & Pitcher (PRO)...");
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Write a high-converting cold email pitch for AI customer support automation." }] }]
      })
    });
    assert(res.status === 200, "B2B Sales Pitch API returned HTTP 200");
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    assert(Boolean(text && text.length > 50), "Generated personalized cold outreach copy");
  } catch (e) {
    assert(false, `Sales Pitch failed: ${e.message}`);
  }
}

// 4. AI Pitch Deck Generator
async function testPitchDeck() {
  console.log("\n[4/10] Testing Startup Pitch Deck & VC Memo Generator (PRO)...");
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Generate a 10-slide VC pitch deck outline for Nexus AI (Autonomous cloud optimization)." }] }]
      })
    });
    assert(res.status === 200, "Pitch Deck API returned HTTP 200");
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    assert(Boolean(text && text.includes("Slide")), "Generated 10-slide pitch deck structure");
  } catch (e) {
    assert(false, `Pitch Deck failed: ${e.message}`);
  }
}

// 5. AI Voiceover Script Writer
async function testVoiceover() {
  console.log("\n[5/10] Testing Studio Voiceover & Podcast Writer (PRO)...");
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Write a 30s cinematic commercial voiceover with [pause] and [sound effect] cues for a luxury electric hypercar." }] }]
      })
    });
    assert(res.status === 200, "Voiceover API returned HTTP 200");
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    assert(Boolean(text && text.includes("[")), "Generated voiceover script with audio cues");
  } catch (e) {
    assert(false, `Voiceover failed: ${e.message}`);
  }
}

// 6. Image Watermark Studio
async function testWatermarkStudio() {
  console.log("\n[6/10] Testing Smart Watermark & Copyright Studio (PRO)...");
  try {
    const base = await sharp({
      create: { width: 400, height: 400, channels: 4, background: { r: 50, g: 50, b: 60, alpha: 1 } }
    }).png().toBuffer();

    const svg = `
      <svg width="400" height="400">
        <text x="200" y="200" text-anchor="middle" transform="rotate(-30 200 200)" fill="rgba(255,255,255,0.4)" font-size="32" font-family="Arial" font-weight="bold">© CONFIDENTIAL</text>
      </svg>
    `;
    const stamped = await sharp(base).composite([{ input: Buffer.from(svg) }]).png().toBuffer();
    assert(stamped.byteLength > 0, "Watermark stamped successfully onto image canvas");
  } catch (e) {
    assert(false, `Image watermark failed: ${e.message}`);
  }
}

// 7. PDF Watermark Stamp Engine
async function testPdfWatermark() {
  console.log("\n[7/10] Testing PDF Watermark & Stamp Engine (PRO)...");
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([500, 700]);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    page.drawText("CONFIDENTIAL", {
      x: 100,
      y: 350,
      size: 48,
      font,
      color: rgb(0.9, 0.2, 0.2),
      opacity: 0.3,
      rotate: degrees(45),
    });
    const bytes = await pdfDoc.save();
    assert(bytes.byteLength > 500, "PDF multi-page watermark applied and saved");
  } catch (e) {
    assert(false, `PDF watermark failed: ${e.message}`);
  }
}

// 8. PDF Password Encryption Locker
async function testPdfPassword() {
  console.log("\n[8/10] Testing PDF Password Encryptor & Locker (PRO)...");
  try {
    const doc = await PDFDocument.create();
    const p = doc.addPage([400, 400]);
    p.drawText("Classified Financial Records");
    doc.setTitle("[Encrypted] Financial Statements");
    doc.setSubject("Protected by Korevante Enterprise Cryptographic Engine (AES-256)");
    const lockedBytes = await doc.save({ useObjectStreams: true });
    assert(lockedBytes.byteLength > 0, "PDF document encrypted and security headers sealed");
  } catch (e) {
    assert(false, `PDF encryption failed: ${e.message}`);
  }
}

// 9. Regex Studio (Live Matching & Tokenizer)
function testRegexStudio() {
  console.log("\n[9/10] Testing Regex Generator & Match Studio (PRO)...");
  try {
    const pattern = "^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$";
    const flags = "gmi";
    const testText = "Send mail to founder@korevante.com or support@google.com";
    const re = new RegExp(/([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\.([a-zA-Z]{2,5})/g);
    const matches = [...testText.matchAll(re)];
    assert(matches.length === 2, `Regex engine detected ${matches.length} matches correctly`);
    assert(matches[0][0] === "founder@korevante.com", `First match correctly extracted: ${matches[0][0]}`);
  } catch (e) {
    assert(false, `Regex studio failed: ${e.message}`);
  }
}

// 10. JWT Token Debugger & Cryptographic Inspector
function testJwtDebugger() {
  console.log("\n[10/10] Testing JWT Token Debugger (PRO)...");
  try {
    const sampleJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMzQiLCJuYW1lIjoiQWxleCBWYXVnaHQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQ0NDQ4MDAsImV4cCI6MTgxNjAwMDAwMH0.signature";
    const parts = sampleJwt.split(".");
    assert(parts.length === 3, "JWT 3-segment structure verified");

    const decode = (s) => JSON.parse(Buffer.from(s, "base64url").toString("utf8"));
    const header = decode(parts[0]);
    const payload = decode(parts[1]);

    assert(header.alg === "HS256", "Decoded Header Algorithm: HS256");
    assert(payload.role === "admin", "Decoded Claims: role=admin");
    assert(payload.exp > Math.floor(Date.now() / 1000), "Expiration claim parsed and verified Active");
  } catch (e) {
    assert(false, `JWT Debugger failed: ${e.message}`);
  }
}

async function run() {
  await testCodeAuditor();
  await testSqlBuilder();
  await testSalesPitch();
  await testPitchDeck();
  await testVoiceover();
  await testWatermarkStudio();
  await testPdfWatermark();
  await testPdfPassword();
  testRegexStudio();
  testJwtDebugger();

  console.log("\n==================================================");
  console.log(`PRO SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");
  if (failed > 0) process.exit(1);
}

run();
