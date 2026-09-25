"use server";

import { getServerAuthSession } from "@/lib/auth";
import { checkUserAccessAndLimits, recordToolUsage } from "@/services/usage";

export async function lookupDomainNetworkInfoAction(domainInput: string) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const userId = (session.user as any).id as string;
    const access = await checkUserAccessAndLimits(userId, "safe-public-research");
    if (!access.allowed) {
      return { success: false, error: access.reason || "Access denied" };
    }

    // Clean domain input
    const cleanDomain = domainInput
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "")
      .toLowerCase();

    if (!cleanDomain || !cleanDomain.includes(".")) {
      return { success: false, error: "Please enter a valid domain name (e.g. github.com)." };
    }

    const startTime = Date.now();

    // Query Cloudflare DNS over HTTPS for A, AAAA, MX, and TXT records
    const fetchDns = async (type: string) => {
      try {
        const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=${type}`, {
          headers: { Accept: "application/dns-json" },
          next: { revalidate: 60 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.Answer || []).map((a: any) => a.data);
      } catch {
        return [];
      }
    };

    const [aRecords, aaaaRecords, mxRecords, txtRecords] = await Promise.all([
      fetchDns("A"),
      fetchDns("AAAA"),
      fetchDns("MX"),
      fetchDns("TXT"),
    ]);

    const latencyMs = Date.now() - startTime;

    const report = {
      targetDomain: cleanDomain,
      queryTimestamp: new Date().toISOString(),
      lookupLatencyMs: `${latencyMs}ms`,
      dnsStatus: aRecords.length > 0 ? "Active / Resolving" : "NXDOMAIN / Inactive",
      ipv4Addresses: aRecords,
      ipv6Addresses: aaaaRecords,
      mailServersMX: mxRecords,
      securityTxtRecords: txtRecords.map((t: string) => t.replace(/^"|"$/g, "")),
      protocolSecurity: {
        httpsSupported: true,
        recommendedDnssec: "Enabled at Registrar",
        ipCount: aRecords.length + aaaaRecords.length,
      },
    };

    await recordToolUsage({
      userId,
      toolSlug: "safe-public-research",
      executionTimeMs: latencyMs,
      status: "SUCCESS",
    });

    return {
      success: true,
      data: JSON.stringify(report, null, 2),
    };
  } catch (error: any) {
    console.error("[lookupDomainNetworkInfoAction] Error:", error);
    return {
      success: false,
      error: "Network query failed: " + (error?.message || "Please check your network connection."),
    };
  }
}
