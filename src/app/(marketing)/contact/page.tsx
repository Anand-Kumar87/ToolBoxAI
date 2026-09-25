"use client";

import * as React from "react";
import { 
  Mail, MessageSquare, Phone, Send, MapPin, Clock, 
  ShieldCheck, Sparkles, Check, ArrowRight, ExternalLink, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContactInquiryAction } from "@/actions/contact";
import { toast } from "sonner";

export default function ContactPage() {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await submitContactInquiryAction(formData);
      if (res.success) {
        setSuccess(true);
        toast.success("Message sent successfully!");
      } else {
        toast.error(res.error || "Failed to send message.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Ambient Horizon Dome Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] emerald-dome-glow pointer-events-none -z-10" />

      {/* Hero Header */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-20 text-center border-b border-border/40 relative">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill mb-6 border border-primary/25 text-xs font-bold text-foreground shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="tracking-wide uppercase font-extrabold text-[11px]">PRIORITY SUPPORT &amp; INQUIRIES</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-foreground leading-[1.08] mb-6">
            Get in Touch with Our{" "}
            <span className="gradient-text-mint block sm:inline">
              Core Team
            </span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Have questions regarding custom enterprise plans, tool integrations, or need immediate assistance? We are here to help you scale seamlessly.
          </p>
        </div>
      </section>

      {/* Contact Content Split-Screen */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* Left Column: Real Contact Touchpoints */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-primary/20 text-xs font-bold text-primary mb-3">
                  <span>DIRECT TOUCHPOINTS</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  Direct VIP Channels
                </h2>
                <p className="text-muted-foreground text-sm mt-2 font-medium">
                  Connect instantly with our leadership and support engineers through verified direct lines.
                </p>
              </div>

              <div className="space-y-4">
                
                {/* WhatsApp Direct Line */}
                <div className="glass-card rounded-2xl p-6 border border-border/80 hover:border-emerald-500/50 transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-extrabold text-foreground text-base">WhatsApp VIP Support</h3>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Instant
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 mb-2 font-medium">
                        Fastest way to connect for live support, queries, and quick onboarding.
                      </p>
                      <a 
                        href="https://wa.me/919953467547?text=Hello%20ToolVerse%20AI%20Team" 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary font-bold text-sm hover:underline"
                      >
                        <span>+91 9953467547</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email Support */}
                <div className="glass-card rounded-2xl p-6 border border-border/80 hover:border-emerald-500/50 transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-teal-500/20 to-cyan-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-110 transition-transform">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-extrabold text-foreground text-base">Official Email</h3>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                          24h SLA
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 mb-2 font-medium">
                        Direct communication for enterprise proposals, billing, and technical audits.
                      </p>
                      <a 
                        href="mailto:Solestyle41@gmail.com" 
                        className="inline-flex items-center gap-1.5 text-primary font-bold text-sm hover:underline break-all"
                      >
                        <span>Solestyle41@gmail.com</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Physical Headquarters */}
                <div className="glass-card rounded-2xl p-6 border border-border/80 hover:border-emerald-500/50 transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-110 transition-transform">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-foreground text-base">Office &amp; Headquarters</h3>
                      <p className="text-xs text-muted-foreground mt-1 mb-2 font-medium">
                        ToolVerse AI Operations Hub
                      </p>
                      <p className="text-sm font-bold text-foreground leading-relaxed">
                        Anand Parbat, New Delhi - 110005, India
                      </p>
                    </div>
                  </div>
                </div>

                {/* Operating Hours & Live Status */}
                <div className="glass-card rounded-2xl p-6 border border-border/80 space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Operational Hours</h4>
                      <p className="text-xs text-muted-foreground font-medium">
                        Monday – Saturday: 9:00 AM – 8:00 PM IST
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-foreground">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>Live Systems Operational</span>
                    </span>
                    <span className="text-emerald-400 font-mono">99.99% Uptime</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Ultra-Luxury Glass Contact Form */}
            <div className="lg:col-span-7">
              <div className="glass-card rounded-3xl p-8 sm:p-10 border border-border/80 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 emerald-radial-glow pointer-events-none -z-10 opacity-70" />

                <div className="mb-8">
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    Send Us an Inquiry
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">
                    Fill out the form below and our engineering team will get back to you shortly.
                  </p>
                </div>

                {success ? (
                  <div className="p-8 sm:p-10 text-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-5 animate-in fade-in zoom-in duration-300">
                    <div className="h-16 w-16 bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                      <Check className="h-8 w-8 stroke-[3]" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-black text-foreground">Message Received!</h4>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed font-medium">
                        Thank you for reaching out. A confirmation has been routed to our priority desk. We will contact you at <span className="text-foreground font-bold">{formData.email || "your email"}</span> promptly.
                      </p>
                    </div>
                    <Button 
                      onClick={() => {
                        setSuccess(false);
                        setFormData({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
                      }} 
                      variant="outline" 
                      className="glass-pill rounded-full px-8 h-12 font-bold hover:border-primary/50"
                    >
                      Send Another Inquiry
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Your Full Name <span className="text-primary">*</span>
                        </label>
                        <Input 
                          required 
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Rahul Sharma" 
                          className="h-12 rounded-xl bg-background/60 border-border/80 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Email Address <span className="text-primary">*</span>
                        </label>
                        <Input 
                          required 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. rahul@company.com" 
                          className="h-12 rounded-xl bg-background/60 border-border/80 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Phone / WhatsApp (Optional)
                        </label>
                        <Input 
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 9953467547" 
                          className="h-12 rounded-xl bg-background/60 border-border/80 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Inquiry Subject
                        </label>
                        <select 
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full h-12 rounded-xl bg-background/60 border border-border/80 px-3.5 text-sm font-medium text-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        >
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Enterprise Billing / Custom Plan">Enterprise Billing / Custom Plan</option>
                          <option value="Technical Support & Bugs">Technical Support &amp; Bugs</option>
                          <option value="Tool Feature Request">Tool Feature Request</option>
                          <option value="Partnership & Affiliates">Partnership &amp; Affiliates</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Detailed Message <span className="text-primary">*</span>
                      </label>
                      <Textarea 
                        required 
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us what you're looking to achieve or any specific question you have..." 
                        className="min-h-[140px] rounded-xl bg-background/60 border-border/80 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-sm font-medium leading-relaxed"
                      />
                    </div>

                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-14 rounded-2xl font-black text-base gradient-btn shadow-2xl shadow-emerald-500/35 hover:shadow-emerald-400/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5"
                      >
                        {loading ? (
                          <>
                            <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                            <span>Transmitting Message...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Submit Priority Message</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="pt-2 flex items-center justify-center gap-4 text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-primary" /> 256-bit Encrypted
                      </span>
                      <span>•</span>
                      <span>Zero Spam Guarantee</span>
                      <span>•</span>
                      <span>Fast Turnaround</span>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
