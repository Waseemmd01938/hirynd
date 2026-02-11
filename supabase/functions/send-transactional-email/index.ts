import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FROM_ADDRESS = "HYRIND <noreply@hyrind.com>";
const REPLY_TO = "support@hyrind.com";

type EmailType =
  | "registration_received"
  | "new_registration_request"
  | "approval_granted"
  | "approval_rejected"
  | "interest_confirmation"
  | "interest_admin_notification"
  | "referral_email";

interface EmailRequest {
  type: EmailType;
  payload: Record<string, string>;
}

async function logEmail(email_type: string, recipient_email: string, status: string, error_message?: string) {
  try {
    await supabase.from("email_logs").insert({
      email_type,
      recipient_email,
      status,
      error_message: error_message || null,
    });
  } catch (e) {
    console.error("Failed to log email:", e);
  }
}

async function getAdminEmails(): Promise<string[]> {
  const { data } = await supabase
    .from("admin_config")
    .select("config_value")
    .eq("config_key", "admin_notification_email")
    .single();

  if (data?.config_value) {
    return data.config_value.split(",").map((e: string) => e.trim()).filter(Boolean);
  }
  return ["admin@hyrind.com"];
}

function buildEmail(type: EmailType, payload: Record<string, string>): { subject: string; html: string; to: string[] } | null {
  const name = payload.name || "there";
  const email = payload.email || "";

  switch (type) {
    case "registration_received":
      return {
        to: [email],
        subject: "Welcome to HYRIND — Registration Received",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1e3a5f;">Thank You for Registering!</h1>
            <p>Hi ${name},</p>
            <p>We've received your registration at HYRIND. Our team will review your application and get back to you within <strong>24–48 hours</strong>.</p>
            <p>You'll receive an email once your account has been approved.</p>
            <p>In the meantime, feel free to explore our website: <a href="https://hyrind.com">hyrind.com</a></p>
            <p>Best regards,<br/>The HYRIND Team</p>
          </div>
        `,
      };

    case "new_registration_request":
      return {
        to: [], // will be replaced with admin emails
        subject: `New Registration: ${name} (${payload.role || "candidate"})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e3a5f;">New Registration Request</h2>
            <table style="border-collapse: collapse; width: 100%;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Name</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Role</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${payload.role || "candidate"}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Registered At</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${payload.created_at || new Date().toISOString()}</td></tr>
            </table>
            <p style="margin-top: 16px;"><a href="https://hyrind.com/admin-dashboard/approvals" style="display: inline-block; padding: 12px 24px; background: #1e3a5f; color: white; text-decoration: none; border-radius: 6px;">Review in Admin Dashboard</a></p>
          </div>
        `,
      };

    case "approval_granted":
      return {
        to: [email],
        subject: "Your HYRIND Account Has Been Approved!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1e3a5f;">Account Approved!</h1>
            <p>Hi ${name},</p>
            <p>Great news! Your HYRIND account has been approved. You can now log in and access your dashboard.</p>
            <p><a href="https://hyrind.com/candidate-login" style="display: inline-block; padding: 12px 24px; background: #1e3a5f; color: white; text-decoration: none; border-radius: 6px;">Log In Now</a></p>
            <p>Best regards,<br/>The HYRIND Team</p>
          </div>
        `,
      };

    case "approval_rejected":
      return {
        to: [email],
        subject: "HYRIND Account Update",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1e3a5f;">Account Update</h1>
            <p>Hi ${name},</p>
            <p>Thank you for your interest in HYRIND. After reviewing your application, we're unable to approve your account at this time.</p>
            ${payload.reason ? `<p><em>Reason: ${payload.reason}</em></p>` : ""}
            <p>If you believe this was made in error or have questions, please contact us at <a href="mailto:support@hyrind.com">support@hyrind.com</a>.</p>
            <p>Best regards,<br/>The HYRIND Team</p>
          </div>
        `,
      };

    case "interest_confirmation":
      return {
        to: [email],
        subject: "Thank you for your interest in HYRIND!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1e3a5f;">Welcome to HYRIND!</h1>
            <p>Hi ${name},</p>
            <p>Thank you for expressing interest in HYRIND's profile marketing and career support services.</p>
            <p>Our team will review your submission and reach out within <strong>24–48 hours</strong> to schedule a discovery call.</p>
            <h3>What happens next?</h3>
            <ol>
              <li>A team member will contact you to learn more about your career goals</li>
              <li>We'll assess your profile and recommend the best service plan</li>
              <li>Once approved, you'll get access to your personal candidate portal</li>
            </ol>
            <p>In the meantime, feel free to explore our website: <a href="https://hyrind.com">hyrind.com</a></p>
            <p>Best regards,<br/>The HYRIND Team</p>
          </div>
        `,
      };

    case "interest_admin_notification":
      return {
        to: [], // will be replaced with admin emails
        subject: `New Interest Form: ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e3a5f;">New Interest Form Submission</h2>
            <table style="border-collapse: collapse; width: 100%;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Name</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Phone</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${payload.phone || "—"}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">University</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${payload.university || "—"}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Visa Status</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${payload.visa_status || "—"}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Referral Source</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${payload.referral_source || "—"}</td></tr>
            </table>
            <p style="margin-top: 16px;"><a href="https://hyrind.com/admin-dashboard">View in Admin Dashboard</a></p>
          </div>
        `,
      };

    case "referral_email":
      return {
        to: [email],
        subject: `${payload.referrer_name || "A friend"} thinks you'd be great for HYRIND!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1e3a5f;">You've Been Referred to HYRIND!</h1>
            <p>Hi ${payload.friend_name || "there"},</p>
            <p><strong>${payload.referrer_name || "Someone you know"}</strong> thinks you'd benefit from HYRIND's career support services.</p>
            ${payload.referral_note ? `<p><em>"${payload.referral_note}"</em></p>` : ""}
            <h3>What is HYRIND?</h3>
            <p>HYRIND is a recruiter-led profile marketing platform that helps job seekers land interviews and full-time roles through:</p>
            <ul>
              <li>Dedicated recruiter support</li>
              <li>Daily job submissions on your behalf</li>
              <li>Resume optimization and interview preparation</li>
            </ul>
            <p><a href="https://hyrind.com/contact" style="display: inline-block; padding: 12px 24px; background: #1e3a5f; color: white; text-decoration: none; border-radius: 6px;">Learn More & Get Started</a></p>
            <p>Best regards,<br/>The HYRIND Team</p>
          </div>
        `,
      };

    default:
      return null;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, payload }: EmailRequest = await req.json();

    if (!type || !payload) {
      return new Response(JSON.stringify({ error: "Missing type or payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const email = buildEmail(type, payload);
    if (!email) {
      return new Response(JSON.stringify({ error: "Unknown email type" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Replace empty to with admin emails for admin notification types
    if (email.to.length === 0 || (email.to.length === 1 && email.to[0] === "")) {
      email.to = await getAdminEmails();
    }

    const emailResponse = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email.to,
      subject: email.subject,
      html: email.html,
      reply_to: REPLY_TO,
    });

    console.log("Email sent:", type, email.to, emailResponse);
    await logEmail(type, email.to.join(","), "sent");

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);

    try {
      const body = await req.clone().json().catch(() => ({}));
      await logEmail(body.type || "unknown", body.payload?.email || "unknown", "failed", error.message);
    } catch (_) {}

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
