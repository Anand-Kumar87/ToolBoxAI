import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "connected";

  try {
    // Quick DB ping to confirm connectivity
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = "disconnected";
  }

  const responseTimeMs = Date.now() - startTime;
  const isHealthy = dbStatus === "connected";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      responseTimeMs,
      uptimeSeconds: Math.floor(process.uptime()),
      services: {
        database: dbStatus,
        api: "healthy",
      },
      app: "Korevante Studio",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    },
    { status: isHealthy ? 200 : 503 }
  );
}
