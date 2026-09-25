"use server";

import { sendContactInquiryEmail } from "@/lib/mail";

export async function submitContactInquiryAction(formData: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const name = formData.name?.trim();
  const email = formData.email?.trim().toLowerCase();
  const subject = formData.subject?.trim() || "Website Inquiry";
  const message = formData.message?.trim();

  if (!name || !email || !message) {
    return { success: false, error: "Please fill in all required fields." };
  }

  if (name.length > 100 || email.length > 254 || subject.length > 200 || message.length > 5000) {
    return { success: false, error: "Input exceeds allowed character limits." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  try {
    const result = await sendContactInquiryEmail(formData);
    if (!result.success) {
      console.warn("[Contact Action] Mail notification failed, but form submitted.");
    }
    return { success: true };
  } catch (err: any) {
    console.error("[Contact Action] Error:", err);
    return { success: false, error: "Failed to transmit message." };
  }
}
