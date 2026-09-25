import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  textClassName?: string;
  href?: string;
}

const sizeMap = {
  xs: { icon: "h-6 w-6", text: "text-base", sub: "text-[9px]" },
  sm: { icon: "h-8 w-8", text: "text-lg", sub: "text-[10px]" },
  md: { icon: "h-9 w-9", text: "text-xl", sub: "text-xs" },
  lg: { icon: "h-12 w-12", text: "text-2xl", sub: "text-xs" },
  xl: { icon: "h-16 w-16", text: "text-3xl", sub: "text-sm" },
};

export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_0_15px_rgba(0,242,176,0.35)]", className)}
    >
      <defs>
        <radialGradient id="logoBg" cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#092625" />
          <stop offset="50%" stopColor="#051014" />
          <stop offset="100%" stopColor="#020508" />
        </radialGradient>

        <linearGradient id="logoRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f2b0" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#14b8a6" stopOpacity="0.3" />
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0df5e3" stopOpacity="0.7" />
        </linearGradient>

        <linearGradient id="logoPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#00f2b0" />
          <stop offset="65%" stopColor="#0df5e3" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <linearGradient id="logoSecondary" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="40%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>

        <radialGradient id="logoFlare" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#00f2b0" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#0df5e3" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Squircle Bezel Base */}
      <rect 
        x="16" 
        y="16" 
        width="480" 
        height="480" 
        rx="112" 
        fill="url(#logoBg)" 
        stroke="url(#logoRim)" 
        strokeWidth={6} 
      />

      {/* Ambient Neural Core Glow */}
      <circle cx="256" cy="256" r="140" fill="url(#logoFlare)" opacity={0.6} />

      {/* Geometric Interlocking T & V Emblem */}
      <g>
        {/* Top Crossbar of T */}
        <path 
          d="M136 148 C136 140 142 136 150 136 L362 136 C370 136 376 140 376 148 L356 192 C353 198 346 202 338 202 L174 202 C166 202 159 198 156 192 Z" 
          fill="url(#logoPrimary)" 
        />

        {/* Left Wing of V */}
        <path 
          d="M152 220 L212 360 C216 370 226 376 236 376 L256 376 L204 220 Z" 
          fill="url(#logoPrimary)" 
        />

        {/* Right Wing of V */}
        <path 
          d="M360 220 L300 360 C296 370 286 376 276 376 L256 376 L308 220 Z" 
          fill="url(#logoSecondary)" 
        />

        {/* Vertical Stem */}
        <path 
          d="M236 190 L276 190 L266 330 C265 336 261 340 256 340 C251 340 247 336 246 330 Z" 
          fill="url(#logoPrimary)" 
          opacity={0.95}
        />

        {/* Vertex Arrow */}
        <path 
          d="M232 376 L256 416 C258 420 262 420 264 416 L288 376 Z" 
          fill="#00f2b0" 
        />
      </g>

      {/* 4-Point AI Intelligence Sparkle */}
      <g transform="translate(256, 256)">
        <ellipse cx="0" cy="0" rx="42" ry="4.5" fill="#ffffff" />
        <ellipse cx="0" cy="0" rx="4.5" ry="42" fill="#ffffff" />
        <circle cx="0" cy="0" r="14" fill="#ffffff" />
        <circle cx="0" cy="0" r="7" fill="#0df5e3" />
      </g>

      {/* Top Specular Rim */}
      <path 
        d="M60 70 Q256 35 452 70" 
        stroke="#ffffff" 
        strokeWidth={3} 
        strokeLinecap="round" 
        opacity={0.35} 
        fill="none" 
      />
    </svg>
  );
}

export function Logo({
  size = "md",
  showText = true,
  className,
  textClassName,
  href = "/",
}: LogoProps) {
  const currentSize = sizeMap[size];

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 transition-transform hover:scale-[1.02] group select-none", className)}>
      <div className={cn("relative flex items-center justify-center transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(0,242,176,0.5)]", currentSize.icon)}>
        <LogoIcon className="w-full h-full" />
      </div>
      
      {showText && (
        <span className={cn("font-black tracking-[-0.03em] text-foreground flex items-center leading-none", currentSize.text, textClassName)}>
          <span>Korevante</span>
          <span className="ml-1.5 gradient-text-mint font-black">Studio</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
