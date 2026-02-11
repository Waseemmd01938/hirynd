import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

interface AdminQAChecklistProps {
  candidateId: string;
  candidateStatus: string;
}

interface CheckItem {
  label: string;
  done: boolean;
}

const AdminQAChecklist = ({ candidateId, candidateStatus }: AdminQAChecklistProps) => {
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const statusOrder = ["lead", "approved", "intake_submitted", "roles_suggested", "roles_confirmed", "paid", "credential_completed", "active_marketing", "paused", "cancelled", "placed"];
      const idx = statusOrder.indexOf(candidateStatus);

      const [
        { count: credCount },
        { count: assignCount },
        { count: logCount },
        { count: interviewCount },
        { count: placementCount },
      ] = await Promise.all([
        supabase.from("credential_intake_sheets").select("*", { count: "exact", head: true }).eq("candidate_id", candidateId),
        supabase.from("candidate_assignments").select("*", { count: "exact", head: true }).eq("candidate_id", candidateId).eq("is_active", true),
        supabase.from("daily_submission_logs").select("*", { count: "exact", head: true }).eq("candidate_id", candidateId),
        supabase.from("interview_logs").select("*", { count: "exact", head: true }).eq("candidate_id", candidateId),
        supabase.from("placement_closures").select("*", { count: "exact", head: true }).eq("candidate_id", candidateId),
      ]);

      setChecks([
        { label: "Intake complete", done: idx >= 2 },
        { label: "Roles confirmed", done: idx >= 4 },
        { label: "Payment received", done: idx >= 5 },
        { label: "Credentials submitted", done: (credCount || 0) > 0 },
        { label: "Recruiter assigned", done: (assignCount || 0) > 0 },
        { label: "Marketing started", done: idx >= 7 || candidateStatus === "placed" },
        { label: "Applications logged", done: (logCount || 0) > 0 },
        { label: "Interviews logged", done: (interviewCount || 0) > 0 },
        { label: "Placement closed", done: (placementCount || 0) > 0 },
      ]);
      setLoading(false);
    };
    run();
  }, [candidateId, candidateStatus]);

  if (loading) return null;

  return (
    <Card className="mb-6">
      <CardHeader><CardTitle className="text-base">QA Checklist</CardTitle></CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        {checks.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            {item.done ? <CheckCircle className="h-4 w-4 text-secondary" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}
            <span className={`text-sm ${item.done ? "text-card-foreground" : "text-muted-foreground"}`}>{item.label}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AdminQAChecklist;
