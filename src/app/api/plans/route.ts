import { NextResponse } from "next/server";
import { getUnifiedPlans } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const plans = await getUnifiedPlans();
    return NextResponse.json({ success: true, plans });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load plans" },
      { status: 500 }
    );
  }
}
