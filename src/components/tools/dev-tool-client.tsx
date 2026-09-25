"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Code,
  Copy,
  CheckCircle2,
  RefreshCcw,
  Loader2,
  Download,
  QrCode,
  Pipette,
  Globe,
  Scale,
  ShieldAlert,
  UserCheck,
  Fingerprint,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  UploadCloud,
  MapPin,
  Phone,
  Wifi,
  Radio,
  Lock,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToolDefinition } from "@/types";
import { checkToolAccessAction, recordClientToolUsageAction } from "@/actions/usage";
import { lookupDomainNetworkInfoAction } from "@/actions/network";
import { lookupIpAndTelecomIntelAction } from "@/actions/intel";
import { scanSocialFootprintAction, scanDataBreachExposureAction } from "@/actions/privacy";
import QRCode from "qrcode";
import jsQR from "jsqr";

interface DevToolClientProps {
  tool: ToolDefinition;
}

export function DevToolClient({ tool }: DevToolClientProps) {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);

  // Structured results for advanced tools
  const [structuredIntel, setStructuredIntel] = React.useState<any>(null);
  const [structuredPrivacy, setStructuredPrivacy] = React.useState<any>(null);
  const [structuredBreach, setStructuredBreach] = React.useState<any>(null);
  const [uploadedImageBase64, setUploadedImageBase64] = React.useState<string | null>(null);
  const [uploadedImageName, setUploadedImageName] = React.useState<string | null>(null);
  const [qrScanImage, setQrScanImage] = React.useState<File | null>(null);
  const [qrScanImageUrl, setQrScanImageUrl] = React.useState<string | null>(null);

  // Custom states for specific tools
  const [options, setOptions] = React.useState<Record<string, any>>({
    passwordLength: 16,
    passwordSymbols: true,
    passwordNumbers: true,
    caseFormat: "uppercase",
    base64Mode: "encode",
    urlMode: "encode",
    // Unit converter
    unitCategory: "length",
    unitFrom: "meters",
    unitTo: "feet",
    // Color picker
    colorHex: "#3B82F6",
  });

  // Initialize defaults for specialized tools
  React.useEffect(() => {
    if (tool.slug === "password-generator") {
      generatePassword();
    } else if (tool.slug === "color-picker") {
      updateColor("#3B82F6");
    } else if (tool.slug === "safe-public-research") {
      setInput("github.com");
    } else if (tool.slug === "qr-code-generator") {
      setInput("https://korevante.com");
    } else if (tool.slug === "unit-converter") {
      setInput("100");
    } else if (tool.slug === "regex-studio") {
      setInput("^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$");
      setOptions((p) => ({
        ...p,
        regexFlags: "gmi",
        regexTestString: "Contact us at support@korevante.com or admin@google.com for assistance.",
      }));
    } else if (tool.slug === "jwt-debugger") {
      setInput("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMzQ1IiwibmFtZSI6IkFsZXggV2Fsa2VyIiwiYWRtaW4iOnRydWUsImlhdCI6MTc3NDQ0NDgwMCwiZXhwIjoxODE2MDAwMDAwfQ.3l8w39g1Lz5-example_signature");
    } else if (tool.slug === "ip-telecom-intel") {
      setInput("8.8.8.8");
    } else if (tool.slug === "social-footprint-scanner") {
      setInput("alex_walker");
    } else if (tool.slug === "data-breach-scanner") {
      setInput("alex@gmail.com");
    }
  }, [tool.slug]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";
    const syms = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let pool = chars;
    if (options.passwordNumbers) pool += nums;
    if (options.passwordSymbols) pool += syms;

    const length = options.passwordLength as number;
    let pass = "";
    for (let i = 0; i < length; i++) {
      pass += pool[Math.floor(Math.random() * pool.length)];
    }
    setOutput(pass);
  };

  const updateColor = (hex: string) => {
    setOptions((p) => ({ ...p, colorHex: hex }));
    // Parse hex to RGB
    const cleanHex = hex.replace("#", "");
    if (cleanHex.length === 6) {
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);

      // Convert RGB to HSL
      const rNorm = r / 255;
      const gNorm = g / 255;
      const bNorm = b / 255;
      const max = Math.max(rNorm, gNorm, bNorm);
      const min = Math.min(rNorm, gNorm, bNorm);
      let h = 0, s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
          case gNorm: h = (bNorm - rNorm) / d + 2; break;
          case bNorm: h = (rNorm - gNorm) / d + 4; break;
        }
        h /= 6;
      }

      const hDeg = Math.round(h * 360);
      const sPct = Math.round(s * 100);
      const lPct = Math.round(l * 100);

      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const contrastWhite = ((1 + 0.05) / (luminance + 0.05)).toFixed(2);
      const contrastBlack = ((luminance + 0.05) / 0.05).toFixed(2);

      const colorData = {
        HEX: hex.toUpperCase(),
        RGB: `rgb(${r}, ${g}, ${b})`,
        HSL: `hsl(${hDeg}, ${sPct}%, ${lPct}%)`,
        RGBA: `rgba(${r}, ${g}, ${b}, 1.0)`,
        PerceivedBrightness: luminance > 0.5 ? "Light" : "Dark",
        WCAG_ContrastAgainstWhite: `${contrastWhite}:1`,
        WCAG_ContrastAgainstBlack: `${contrastBlack}:1`,
      };

      setOutput(JSON.stringify(colorData, null, 2));
    }
  };

  const processTool = async () => {
    setLoading(true);
    const start = Date.now();

    try {
      const access = await checkToolAccessAction(tool.slug);
      if (!access.allowed) {
        toast.error(access.error || "Access Denied");
        setLoading(false);
        return;
      }

      let result = "";

      switch (tool.slug) {
        case "json-formatter": {
          try {
            const parsed = JSON.parse(input);
            result = JSON.stringify(parsed, null, 2);
          } catch {
            toast.error("Invalid JSON syntax.");
            setLoading(false);
            return;
          }
          break;
        }

        case "base64-tool": {
          if (options.base64Mode === "encode") {
            result = btoa(unescape(encodeURIComponent(input)));
          } else {
            try {
              result = decodeURIComponent(escape(atob(input)));
            } catch {
              toast.error("Invalid Base64 string.");
              setLoading(false);
              return;
            }
          }
          break;
        }

        case "url-encoder": {
          if (options.urlMode === "encode") {
            result = encodeURIComponent(input);
          } else {
            result = decodeURIComponent(input);
          }
          break;
        }

        case "password-generator": {
          generatePassword();
          await recordClientToolUsageAction(tool.slug, Date.now() - start);
          setLoading(false);
          return;
        }

        case "text-case-converter": {
          const fmt = options.caseFormat as string;
          if (fmt === "uppercase") result = input.toUpperCase();
          else if (fmt === "lowercase") result = input.toLowerCase();
          else if (fmt === "titlecase") {
            result = input.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
          } else if (fmt === "camelcase") {
            result = input
              .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()))
              .replace(/\s+/g, "");
          } else if (fmt === "snakecase") {
            result = input
              .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
              ?.map((x) => x.toLowerCase())
              .join("_") || input;
          } else if (fmt === "kebabcase") {
            result = input
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)+/g, "");
          }
          break;
        }

        case "qr-code-generator": {
          const qrText = input.trim() || "https://korevante.com";
          try {
            const dataUrl = await QRCode.toDataURL(qrText, {
              width: 512,
              margin: 2,
              color: { dark: "#000000", light: "#FFFFFF" },
            });
            setQrDataUrl(dataUrl);
            result = `QR Code Generated for: ${qrText}\nFormat: High-Definition PNG (512x512)\nReady to scan or download.`;
          } catch (qrErr) {
            toast.error("Failed to generate QR code.");
            setLoading(false);
            return;
          }
          break;
        }

        case "qr-code-scanner": {
          if (!qrScanImageUrl) {
            toast.error("Please upload an image containing a QR code first.");
            setLoading(false);
            return;
          }

          try {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = qrScanImageUrl;
            await new Promise((resolve, reject) => {
              img.onload = () => resolve(true);
              img.onerror = () => reject(new Error("Image failed to load"));
            });

            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Could not initialize canvas");

            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imgData.data, imgData.width, imgData.height);

            if (code && code.data) {
              const dataText = code.data;
              const isUrl = /^https?:\/\//i.test(dataText);
              const isWifi = dataText.startsWith("WIFI:");

              result = [
                `✅ QR Code Decoded Successfully!`,
                `----------------------------------------`,
                `Content / Payload:`,
                dataText,
                ``,
                `Format Details:`,
                `• Type: ${isUrl ? "Hyperlink / Web URL" : isWifi ? "Wi-Fi Configuration" : "Plain Text / Raw Data"}`,
                `• Image Resolution: ${img.naturalWidth} × ${img.naturalHeight} px`,
                `• Checksum Integrity: Verified`,
              ].join("\n");
              toast.success("QR code decoded successfully!");
            } else {
              result =
                "❌ No readable QR code found in this image.\n\nPlease ensure the QR code is clearly visible, in focus, and not severely distorted.";
              toast.error("No QR code detected in the uploaded image.");
            }
          } catch (qrErr: any) {
            toast.error("Failed to read image: " + (qrErr?.message || "Unknown error"));
            setLoading(false);
            return;
          }
          break;
        }

        case "unit-converter": {
          const val = parseFloat(input) || 0;
          const cat = options.unitCategory;
          let converted = 0;
          let unitName = "";

          if (cat === "length") {
            // Base: meters
            const toMeters: Record<string, number> = {
              meters: 1,
              kilometers: 1000,
              centimeters: 0.01,
              feet: 0.3048,
              miles: 1609.34,
              inches: 0.0254,
            };
            const inMeters = val * (toMeters[options.unitFrom] || 1);
            converted = inMeters / (toMeters[options.unitTo] || 1);
            unitName = options.unitTo;
          } else if (cat === "weight") {
            // Base: kilograms
            const toKg: Record<string, number> = {
              kilograms: 1,
              grams: 0.001,
              pounds: 0.453592,
              ounces: 0.0283495,
            };
            const inKg = val * (toKg[options.unitFrom] || 1);
            converted = inKg / (toKg[options.unitTo] || 1);
            unitName = options.unitTo;
          } else if (cat === "temperature") {
            let celsius = val;
            if (options.unitFrom === "fahrenheit") celsius = ((val - 32) * 5) / 9;
            if (options.unitFrom === "kelvin") celsius = val - 273.15;

            if (options.unitTo === "celsius") converted = celsius;
            else if (options.unitTo === "fahrenheit") converted = (celsius * 9) / 5 + 32;
            else if (options.unitTo === "kelvin") converted = celsius + 273.15;
            unitName = options.unitTo;
          } else if (cat === "storage") {
            // Base: Bytes
            const toBytes: Record<string, number> = {
              bytes: 1,
              kb: 1024,
              mb: 1024 ** 2,
              gb: 1024 ** 3,
              tb: 1024 ** 4,
            };
            const inBytes = val * (toBytes[options.unitFrom] || 1);
            converted = inBytes / (toBytes[options.unitTo] || 1);
            unitName = options.unitTo;
          }

          result = `${val} ${options.unitFrom} = ${converted.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${unitName}`;
          break;
        }

        case "color-picker": {
          updateColor(options.colorHex || "#3B82F6");
          await recordClientToolUsageAction(tool.slug, Date.now() - start);
          setLoading(false);
          return;
        }

        case "safe-public-research": {
          const res = await lookupDomainNetworkInfoAction(input);
          if (res.success && res.data) {
            result = res.data;
          } else {
            toast.error(res.error || "Lookup failed.");
            setLoading(false);
            return;
          }
          break;
        }

        case "regex-studio": {
          try {
            const flags = (options.regexFlags as string) || "gmi";
            const testStr = (options.regexTestString as string) || "";
            const safeGlobalFlags = flags.includes("g") ? flags : flags + "g";
            const re = new RegExp(input, safeGlobalFlags);
            const matches = [...testStr.matchAll(re)];

            const explanation = [
              `### 🎯 Regular Expression Match Studio`,
              `**Pattern:** \`/${input}/${flags}\``,
              `**Total Matches Found:** ${matches.length}`,
              ``,
              `#### 📋 Extracted Matches:`,
              matches.length > 0
                ? matches.map((m, idx) => `• **Match #${idx + 1}:** \`${m[0]}\` (Index: ${m.index})`).join("\n")
                : `*(No matches found in the sample text)*`,
              ``,
              `#### 🔍 Test String Analyzed:`,
              `> ${testStr}`,
              ``,
              `#### 💡 Active Flags:`,
              `• **g (global):** ${flags.includes("g") ? "Enabled" : "Disabled"}`,
              `• **m (multiline):** ${flags.includes("m") ? "Enabled" : "Disabled"}`,
              `• **i (ignore-case):** ${flags.includes("i") ? "Enabled" : "Disabled"}`,
            ].join("\n");

            result = explanation;
          } catch (e: any) {
            toast.error("Invalid regular expression syntax: " + (e?.message || ""));
            setLoading(false);
            return;
          }
          break;
        }

        case "jwt-debugger": {
          const token = input.trim();
          const parts = token.split(".");
          if (parts.length !== 3) {
            toast.error("Invalid JWT format. Must contain 3 dot-separated parts (Header.Payload.Signature).");
            setLoading(false);
            return;
          }

          try {
            const b64Decode = (str: string) => {
              let clean = str.replace(/-/g, "+").replace(/_/g, "/");
              while (clean.length % 4) clean += "=";
              return decodeURIComponent(escape(atob(clean)));
            };

            const header = JSON.parse(b64Decode(parts[0]));
            const payload = JSON.parse(b64Decode(parts[1]));
            const signature = parts[2];

            const now = Math.floor(Date.now() / 1000);
            let status = "Active / Valid Structure";
            let expDateStr = "No expiration configured (Infinite)";
            if (payload.exp) {
              const expDate = new Date(payload.exp * 1000);
              expDateStr = expDate.toUTCString();
              status = payload.exp > now ? `Active (Expires in ${Math.round((payload.exp - now) / 60)} minutes)` : "EXPIRED ⚠️";
            }

            const report = {
              VerificationStatus: status,
              Algorithm: header.alg || "Unknown",
              TokenType: header.typ || "JWT",
              ExpiresAt: expDateStr,
              IssuedAt: payload.iat ? new Date(payload.iat * 1000).toUTCString() : "Not specified",
              Subject: payload.sub || "N/A",
              HEADER: header,
              PAYLOAD: payload,
              SIGNATURE_DIGEST: signature.substring(0, 32) + "...",
            };

            result = JSON.stringify(report, null, 2);
          } catch {
            toast.error("Failed to decode token. Ensure valid Base64Url encoding.");
            setLoading(false);
            return;
          }
          break;
        }

        case "ip-telecom-intel": {
          const res = await lookupIpAndTelecomIntelAction(input);
          if (res.success && res.data) {
            setStructuredIntel(res.data);
            result = JSON.stringify(res.data, null, 2);
            toast.success("Intelligence report generated!");
          } else {
            setStructuredIntel(null);
            toast.error(res.error || "Intelligence query failed.");
            setOutput(res.error || "Access Denied: Administrative Clearance Required.");
            setLoading(false);
            return;
          }
          break;
        }

        case "social-footprint-scanner": {
          const res = await scanSocialFootprintAction({
            handle: input,
            imageBase64: uploadedImageBase64 || undefined,
          });
          if (res.success && res.data) {
            setStructuredPrivacy(res.data);
            result = JSON.stringify(res.data, null, 2);
            toast.success("Social footprint & privacy audit completed!");
          } else {
            setStructuredPrivacy(null);
            toast.error(res.error || "Scan failed.");
            setLoading(false);
            return;
          }
          break;
        }

        case "data-breach-scanner": {
          const res = await scanDataBreachExposureAction(input);
          if (res.success && res.data) {
            setStructuredBreach(res.data);
            result = JSON.stringify(res.data, null, 2);
            toast.success("Data breach exposure audit completed!");
          } else {
            setStructuredBreach(null);
            toast.error(res.error || "Audit failed.");
            setLoading(false);
            return;
          }
          break;
        }

        default:
          result = input;
      }

      setOutput(result);
      await recordClientToolUsageAction(tool.slug, Date.now() - start);
    } catch {
      toast.error("An error occurred during processing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ── Left Column: Inputs & Settings ── */}
      <Card className="lg:col-span-6 border-border/80 shadow-sm top-24 sticky">
        <div className="h-14 border-b border-border/50 flex items-center px-6 bg-muted/10 rounded-t-xl shrink-0">
          <h3 className="text-sm font-semibold text-foreground">Input & Settings</h3>
        </div>
        <CardContent className="p-6 space-y-6">
          {tool.slug === "password-generator" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password Length: {options.passwordLength}</label>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={options.passwordLength as number}
                  onChange={(e) => setOptions((p) => ({ ...p, passwordLength: parseInt(e.target.value) }))}
                  className="w-full accent-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sym"
                  checked={options.passwordSymbols as boolean}
                  onChange={(e) => setOptions((p) => ({ ...p, passwordSymbols: e.target.checked }))}
                />
                <label htmlFor="sym" className="text-sm">Include Symbols (!@#$)</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="num"
                  checked={options.passwordNumbers as boolean}
                  onChange={(e) => setOptions((p) => ({ ...p, passwordNumbers: e.target.checked }))}
                />
                <label htmlFor="num" className="text-sm">Include Numbers (0-9)</label>
              </div>
            </div>
          )}

          {tool.slug === "color-picker" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={options.colorHex}
                  onChange={(e) => updateColor(e.target.value)}
                  className="h-14 w-14 rounded-xl cursor-pointer border border-border bg-transparent p-1"
                />
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground font-medium">HEX Code</label>
                  <input
                    type="text"
                    value={options.colorHex}
                    onChange={(e) => updateColor(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background/50 font-mono text-sm uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {tool.slug === "unit-converter" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Category</label>
                <select
                  value={options.unitCategory}
                  onChange={(e) => {
                    const cat = e.target.value;
                    let f = "meters", t = "feet";
                    if (cat === "weight") { f = "kilograms"; t = "pounds"; }
                    if (cat === "temperature") { f = "celsius"; t = "fahrenheit"; }
                    if (cat === "storage") { f = "mb"; t = "gb"; }
                    setOptions((p) => ({ ...p, unitCategory: cat, unitFrom: f, unitTo: t }));
                  }}
                  className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-sm"
                >
                  <option value="length">Length (Meters, Feet, Miles...)</option>
                  <option value="weight">Weight (Kilograms, Pounds, Ounces...)</option>
                  <option value="temperature">Temperature (°C, °F, K)</option>
                  <option value="storage">Digital Storage (KB, MB, GB, TB)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Convert From</label>
                  <select
                    value={options.unitFrom}
                    onChange={(e) => setOptions((p) => ({ ...p, unitFrom: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-sm capitalize"
                  >
                    {options.unitCategory === "length" && (
                      <>
                        <option value="meters">Meters</option>
                        <option value="kilometers">Kilometers</option>
                        <option value="centimeters">Centimeters</option>
                        <option value="feet">Feet</option>
                        <option value="inches">Inches</option>
                        <option value="miles">Miles</option>
                      </>
                    )}
                    {options.unitCategory === "weight" && (
                      <>
                        <option value="kilograms">Kilograms</option>
                        <option value="grams">Grams</option>
                        <option value="pounds">Pounds</option>
                        <option value="ounces">Ounces</option>
                      </>
                    )}
                    {options.unitCategory === "temperature" && (
                      <>
                        <option value="celsius">Celsius (°C)</option>
                        <option value="fahrenheit">Fahrenheit (°F)</option>
                        <option value="kelvin">Kelvin (K)</option>
                      </>
                    )}
                    {options.unitCategory === "storage" && (
                      <>
                        <option value="bytes">Bytes</option>
                        <option value="kb">Kilobytes (KB)</option>
                        <option value="mb">Megabytes (MB)</option>
                        <option value="gb">Gigabytes (GB)</option>
                        <option value="tb">Terabytes (TB)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-medium">Convert To</label>
                  <select
                    value={options.unitTo}
                    onChange={(e) => setOptions((p) => ({ ...p, unitTo: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-sm capitalize"
                  >
                    {options.unitCategory === "length" && (
                      <>
                        <option value="feet">Feet</option>
                        <option value="meters">Meters</option>
                        <option value="kilometers">Kilometers</option>
                        <option value="centimeters">Centimeters</option>
                        <option value="inches">Inches</option>
                        <option value="miles">Miles</option>
                      </>
                    )}
                    {options.unitCategory === "weight" && (
                      <>
                        <option value="pounds">Pounds</option>
                        <option value="kilograms">Kilograms</option>
                        <option value="grams">Grams</option>
                        <option value="ounces">Ounces</option>
                      </>
                    )}
                    {options.unitCategory === "temperature" && (
                      <>
                        <option value="fahrenheit">Fahrenheit (°F)</option>
                        <option value="celsius">Celsius (°C)</option>
                        <option value="kelvin">Kelvin (K)</option>
                      </>
                    )}
                    {options.unitCategory === "storage" && (
                      <>
                        <option value="gb">Gigabytes (GB)</option>
                        <option value="mb">Megabytes (MB)</option>
                        <option value="kb">Kilobytes (KB)</option>
                        <option value="bytes">Bytes</option>
                        <option value="tb">Terabytes (TB)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Input Value</label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-sm"
                />
              </div>
            </div>
          )}

          {tool.slug === "regex-studio" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium">Regular Expression Pattern</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-mono text-muted-foreground">/</span>
                  <input
                    type="text"
                    placeholder="e.g. ^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 h-10 rounded-lg border border-input bg-background/50 px-3 text-sm font-mono"
                  />
                  <span className="text-sm font-mono text-muted-foreground">/</span>
                  <input
                    type="text"
                    placeholder="flags"
                    value={options.regexFlags || "gmi"}
                    onChange={(e) => setOptions((p) => ({ ...p, regexFlags: e.target.value }))}
                    className="w-16 h-10 rounded-lg border border-input bg-background/50 px-2 text-sm font-mono text-center"
                    title="Regex Flags (e.g. gmi)"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Sample Test Text (Evaluated in Real-Time)</label>
                <textarea
                  placeholder="Enter sample text to test matches..."
                  value={options.regexTestString || ""}
                  onChange={(e) => setOptions((p) => ({ ...p, regexTestString: e.target.value }))}
                  className="w-full h-32 mt-1 rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-mono resize-none"
                />
              </div>
            </div>
          )}

          {tool.slug === "ip-telecom-intel" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-500">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Administrative Intelligence Suite</p>
                  <p className="opacity-90 mt-0.5">
                    Restricted diagnostic tool. Resolves BGP routing, GeoIP, ASN, and international carrier routing prefixes.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">IP Address or Mobile Telecom Number</label>
                <input
                  type="text"
                  placeholder="e.g. 8.8.8.8, 1.1.1.1, or +919876543210"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 font-mono text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] text-muted-foreground font-medium">Quick Query Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Google DNS (8.8.8.8)", val: "8.8.8.8" },
                    { label: "Cloudflare (1.1.1.1)", val: "1.1.1.1" },
                    { label: "India Telecom (+91 98765 43210)", val: "+919876543210" },
                    { label: "US NANP (+1 415 555 2671)", val: "+14155552671" },
                  ].map((chip) => (
                    <button
                      key={chip.val}
                      type="button"
                      onClick={() => setInput(chip.val)}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5 transition-colors font-mono"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tool.slug === "social-footprint-scanner" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-primary" /> Target Social Handle or Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. alex_walker, john_doe"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  Scans across 35+ major platforms to verify active accounts and provide direct logout links.
                </p>
              </div>

              {/* Photo EXIF GPS Leak Audit Upload */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <UploadCloud className="h-3.5 w-3.5 text-primary" /> Upload Photo for GPS Location Leak Audit (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setUploadedImageName(f.name);
                      const reader = new FileReader();
                      reader.onload = () => setUploadedImageBase64(reader.result as string);
                      reader.readAsDataURL(f);
                      toast.success(`Photo selected: ${f.name}`);
                    }
                  }}
                  className="w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
                {uploadedImageName && (
                  <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Image attached: {uploadedImageName}
                  </span>
                )}
              </div>
            </div>
          )}

          {tool.slug === "data-breach-scanner" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <Fingerprint className="h-3.5 w-3.5 text-primary" /> Gmail Address or Mobile Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. user@gmail.com or +919876543210"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  Cross-references known global breach databases to discover leaked passwords, compromised apps, and exposed accounts.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] text-muted-foreground font-medium">Sample Queries:</span>
                <div className="flex flex-wrap gap-1.5">
                  {["test@gmail.com", "admin@company.com", "+919876543210"].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setInput(sample)}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5 transition-colors font-mono"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tool.slug === "qr-code-scanner" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5 text-primary" /> Upload Image with QR Code
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setQrScanImage(f);
                        if (qrScanImageUrl) URL.revokeObjectURL(qrScanImageUrl);
                        const u = URL.createObjectURL(f);
                        setQrScanImageUrl(u);
                        toast.success(`Loaded QR image: ${f.name}`);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className={`w-full h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${
                      qrScanImage
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/20 group-hover:border-primary/50"
                    }`}
                  >
                    <UploadCloud
                      className={`h-7 w-7 mb-1.5 ${qrScanImage ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span className="text-xs text-muted-foreground font-medium text-center px-4 truncate w-full">
                      {qrScanImage ? qrScanImage.name : "Click or drag QR code photo/screenshot here"}
                    </span>
                  </div>
                </div>
              </div>

              {qrScanImageUrl && (
                <div className="p-3 rounded-xl border border-border/70 bg-muted/20 flex flex-col items-center">
                  <img
                    src={qrScanImageUrl}
                    alt="Uploaded QR Code"
                    className="max-h-52 max-w-full object-contain rounded-lg shadow-sm"
                  />
                  <span className="text-[11px] text-muted-foreground mt-2 font-medium">
                    Image ready. Click &apos;Decode QR Code&apos; below.
                  </span>
                </div>
              )}
            </div>
          )}

          {tool.slug !== "password-generator" &&
            tool.slug !== "color-picker" &&
            tool.slug !== "unit-converter" &&
            tool.slug !== "regex-studio" &&
            tool.slug !== "ip-telecom-intel" &&
            tool.slug !== "social-footprint-scanner" &&
            tool.slug !== "data-breach-scanner" &&
            tool.slug !== "qr-code-scanner" && (
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium">
                {tool.slug === "safe-public-research"
                  ? "Target Domain Name (e.g. github.com)"
                  : tool.slug === "jwt-debugger"
                  ? "Encoded JSON Web Token (JWT)"
                  : "Input Data"}
              </label>
              <textarea
                placeholder={
                  tool.slug === "safe-public-research"
                    ? "Enter domain name..."
                    : tool.slug === "qr-code-generator"
                    ? "Enter URL or text for QR code..."
                    : tool.slug === "jwt-debugger"
                    ? "Paste your encoded token (e.g. eyJhbGciOi...)"
                    : "Paste your text or content here..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-48 rounded-xl border border-input bg-background/50 px-4 py-3 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              />
            </div>
          )}

          {tool.slug === "base64-tool" && (
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={options.base64Mode === "encode"} onChange={() => setOptions((p) => ({ ...p, base64Mode: "encode" }))} /> Encode
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={options.base64Mode === "decode"} onChange={() => setOptions((p) => ({ ...p, base64Mode: "decode" }))} /> Decode
              </label>
            </div>
          )}

          {tool.slug === "url-encoder" && (
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={options.urlMode === "encode"} onChange={() => setOptions((p) => ({ ...p, urlMode: "encode" }))} /> Encode
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={options.urlMode === "decode"} onChange={() => setOptions((p) => ({ ...p, urlMode: "decode" }))} /> Decode
              </label>
            </div>
          )}

          {tool.slug === "text-case-converter" && (
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Target Case Format</label>
              <select
                value={options.caseFormat as string}
                onChange={(e) => setOptions((p) => ({ ...p, caseFormat: e.target.value }))}
                className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 text-sm focus:ring-2 focus:ring-primary/50"
              >
                <option value="uppercase">UPPERCASE</option>
                <option value="lowercase">lowercase</option>
                <option value="titlecase">Title Case</option>
                <option value="camelcase">camelCase</option>
                <option value="snakecase">snake_case</option>
                <option value="kebabcase">kebab-case</option>
              </select>
            </div>
          )}

          <Button
            onClick={processTool}
            disabled={
              loading ||
              (tool.slug === "qr-code-scanner"
                ? !qrScanImage
                : tool.slug !== "password-generator" && tool.slug !== "color-picker" && !input)
            }
            variant="gradient"
            className="w-full gap-2 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </>
            ) : tool.slug === "qr-code-scanner" ? (
              <>
                <QrCode className="h-4 w-4" /> Decode QR Code
              </>
            ) : tool.slug === "social-footprint-scanner" ? (
              <>
                <UserCheck className="h-4 w-4" /> Run Privacy Audit
              </>
            ) : tool.slug === "data-breach-scanner" ? (
              <>
                <Fingerprint className="h-4 w-4" /> Scan Compromised Accounts
              </>
            ) : tool.slug === "ip-telecom-intel" ? (
              <>
                <ShieldAlert className="h-4 w-4" /> Run Intelligence Analysis
              </>
            ) : (
              <>
                <RefreshCcw className="h-4 w-4" /> Process / Generate
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ── Right Column: Output Result ── */}
      <Card className="lg:col-span-6 border-border/80 shadow-sm min-h-[440px] flex flex-col">
        <div className="h-14 border-b border-border/50 flex items-center justify-between px-6 bg-muted/10 rounded-t-xl shrink-0">
          <h3 className="text-sm font-semibold text-foreground">Output Result</h3>
          <div className="flex items-center gap-2">
            {qrDataUrl && tool.slug === "qr-code-generator" && (
              <a
                href={qrDataUrl}
                download="toolverse-qr-code.png"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Download className="h-3.5 w-3.5" /> Download PNG
              </a>
            )}
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!output} className="h-8 gap-1.5">
              {copied ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
            </Button>
          </div>
        </div>
        <CardContent className="p-0 flex-1 relative flex flex-col">
          {qrDataUrl && tool.slug === "qr-code-generator" ? (
            <div className="p-6 flex flex-col items-center justify-center flex-1 space-y-4">
              <div className="p-4 bg-white rounded-2xl shadow-xl border border-border">
                <img src={qrDataUrl} alt="Generated QR Code" className="w-56 h-56" />
              </div>
              <p className="text-xs text-muted-foreground font-mono">{input}</p>
            </div>
          ) : tool.slug === "ip-telecom-intel" && structuredIntel ? (
            <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[640px]">
              {/* Intelligence Header */}
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    {structuredIntel.type === "IP_ADDRESS" ? <Wifi className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{structuredIntel.query}</h4>
                    <p className="text-xs text-muted-foreground">
                      {structuredIntel.type === "IP_ADDRESS" ? "Network Routing & GeoIP Intelligence" : "Telecom Operator & Cellular Core"}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                    structuredIntel.riskAssessment.level === "CRITICAL" || structuredIntel.riskAssessment.level === "HIGH"
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : structuredIntel.riskAssessment.level === "MODERATE"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  }`}
                >
                  {structuredIntel.riskAssessment.level} THREAT RISK
                </span>
              </div>

              {/* Summary */}
              <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-xl border border-border/40">
                {structuredIntel.summary}
              </p>

              {/* Data Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(structuredIntel.data).map(([key, val]) => (
                  <div key={key} className="p-2.5 rounded-lg bg-background border border-border/60">
                    <span className="text-[11px] text-muted-foreground uppercase font-mono tracking-wider">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <p className="font-semibold text-foreground mt-0.5 break-words">
                      {typeof val === "object" ? JSON.stringify(val) : String(val)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Risk Indicators */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Verified Diagnostic Indicators
                </h5>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {structuredIntel.riskAssessment.indicators.map((ind: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : tool.slug === "social-footprint-scanner" && structuredPrivacy ? (
            <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[640px]">
              {/* Privacy Score Header */}
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    Public Footprint for &ldquo;{structuredPrivacy.searchedHandle || "Attached Identity"}&rdquo;
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Scanned {structuredPrivacy.totalPlatformsScanned} platforms • {structuredPrivacy.activeProfilesFound} active profiles detected
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-primary">{structuredPrivacy.privacyExposureScore}/100</span>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">{structuredPrivacy.exposureLevel} Exposure</p>
                </div>
              </div>

              {/* EXIF Leak Warning Banner */}
              {structuredPrivacy.exifLeak && (
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                    structuredPrivacy.exifLeak.hasGpsLocation
                      ? "bg-destructive/10 text-destructive border-destructive/30"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  }`}
                >
                  {structuredPrivacy.exifLeak.hasGpsLocation ? (
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">
                      {structuredPrivacy.exifLeak.hasGpsLocation ? "High-Risk Geolocation Leak" : "Clean Photo EXIF"}
                    </p>
                    <p className="mt-0.5 opacity-90">{structuredPrivacy.exifLeak.warningNotice}</p>
                  </div>
                </div>
              )}

              {/* Platforms Grid */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-foreground">Platform Footprint Matrix</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {structuredPrivacy.platforms.map((p: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                        p.status === "ACTIVE"
                          ? "bg-background border-border/80 hover:border-primary/40"
                          : "bg-muted/10 border-border/40 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-xs text-foreground">{p.platform}</p>
                          <span className="text-[10px] text-muted-foreground">{p.category}</span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            p.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      {p.status === "ACTIVE" && (
                        <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                          <a
                            href={p.logoutOrSettingsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                          >
                            Settings & Logout <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Remediation Advice */}
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 space-y-2 text-xs">
                <p className="font-semibold text-foreground">🛡️ Privacy Remediation Steps:</p>
                <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                  {structuredPrivacy.remediationAdvice.map((adv: string, idx: number) => (
                    <li key={idx}>{adv}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : tool.slug === "data-breach-scanner" && structuredBreach ? (
            <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[640px]">
              {/* Breach Header */}
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div>
                  <h4 className="font-bold text-sm text-foreground">Exposure Analysis: {structuredBreach.query}</h4>
                  <p className="text-xs text-muted-foreground">
                    {structuredBreach.totalBreachesFound > 0
                      ? `Found in ${structuredBreach.totalBreachesFound} known data breach incidents`
                      : "Clean record in monitored database catalogs"}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                    structuredBreach.riskRating === "CRITICAL" || structuredBreach.riskRating === "HIGH"
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : structuredBreach.riskRating === "MODERATE"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  }`}
                >
                  {structuredBreach.riskRating} THREAT
                </span>
              </div>

              {/* Leaked Data Types */}
              {structuredBreach.leakedDataTypes.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-foreground">Compromised Data Categories:</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {structuredBreach.leakedDataTypes.map((dt: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 font-medium"
                      >
                        ⚠️ {dt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Breaches List */}
              <div className="space-y-3">
                <h5 className="text-xs font-semibold text-foreground">Compromised Services & Incidents</h5>
                <div className="space-y-2.5">
                  {structuredBreach.breaches.map((b: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-border/80 bg-background space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">{b.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                          {b.breachDate}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{b.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {b.dataClasses.map((dc: string, dIdx: number) => (
                          <span key={dIdx} className="text-[10px] px-2 py-0.5 rounded bg-muted/60 text-foreground font-mono">
                            {dc}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Checklist */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <h5 className="text-xs font-semibold text-foreground">Actionable Defense Checklist</h5>
                <div className="space-y-2">
                  {structuredBreach.securityChecklist.map((item: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-muted/20 border border-border/40 flex items-start justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-bold">{idx + 1}.</span>
                        <span className="text-muted-foreground">{item.action}</span>
                      </div>
                      {item.guideLink && (
                        <a
                          href={item.guideLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline shrink-0 font-medium inline-flex items-center gap-1 text-[11px]"
                        >
                          Remediate <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : output ? (
            <textarea
              readOnly
              value={output}
              className="flex-1 w-full p-6 bg-transparent border-0 resize-none font-mono text-sm focus:outline-none text-foreground/90 leading-relaxed"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground opacity-60">
              <Code className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">Processed output will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
