import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

const downloadCSV = (data: Record<string, any>[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const AdminReportsPage = () => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState("");

  const exportPipeline = async () => {
    setExporting("pipeline");
    const { data: candidates } = await supabase.from("candidates").select("id, status, created_at, updated_at, user_id");
    if (!candidates || candidates.length === 0) { toast({ title: "No data" }); setExporting(""); return; }

    const userIds = candidates.map(c => c.user_id);
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, email").in("user_id", userIds);
    const { data: assignments } = await supabase.from("candidate_assignments").select("candidate_id, recruiter_id, role_type").eq("is_active", true);
    const recruiterIds = [...new Set((assignments || []).map(a => a.recruiter_id))];
    const { data: recruiterProfiles } = recruiterIds.length > 0
      ? await supabase.from("profiles").select("user_id, full_name").in("user_id", recruiterIds)
      : { data: [] };

    const rows = candidates.map(c => {
      const prof = profiles?.find(p => p.user_id === c.user_id);
      const assigns = (assignments || []).filter(a => a.candidate_id === c.id);
      const recruiters = assigns.map(a => {
        const rp = recruiterProfiles?.find(p => p.user_id === a.recruiter_id);
        return `${rp?.full_name || "Unknown"} (${a.role_type})`;
      }).join("; ");
      return {
        candidate_name: prof?.full_name || "",
        email: prof?.email || "",
        status: c.status,
        assigned_recruiters: recruiters,
        created_at: c.created_at,
        last_updated: c.updated_at,
      };
    });

    downloadCSV(rows, "candidate-pipeline.csv");
    toast({ title: "Pipeline exported" });
    setExporting("");
  };

  const exportRecruiterProductivity = async () => {
    setExporting("productivity");
    const { data: assignments } = await supabase.from("candidate_assignments").select("recruiter_id").eq("is_active", true);
    const recruiterIds = [...new Set((assignments || []).map(a => a.recruiter_id))];
    if (recruiterIds.length === 0) { toast({ title: "No data" }); setExporting(""); return; }

    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, email").in("user_id", recruiterIds);
    const { data: logs } = await supabase.from("daily_submission_logs").select("recruiter_id, applications_count");
    const { data: interviews } = await supabase.from("interview_logs").select("submitted_by");

    const rows = recruiterIds.map(rid => {
      const prof = profiles?.find(p => p.user_id === rid);
      const candidateCount = (assignments || []).filter(a => a.recruiter_id === rid).length;
      const totalSubmissions = (logs || []).filter(l => l.recruiter_id === rid).reduce((s, l) => s + l.applications_count, 0);
      const interviewsLogged = (interviews || []).filter(i => i.submitted_by === rid).length;
      return {
        recruiter_name: prof?.full_name || "",
        email: prof?.email || "",
        assigned_candidates: candidateCount,
        total_submissions: totalSubmissions,
        interviews_logged: interviewsLogged,
      };
    });

    downloadCSV(rows, "recruiter-productivity.csv");
    toast({ title: "Productivity exported" });
    setExporting("");
  };

  const exportCandidateActivity = async () => {
    setExporting("activity");
    const { data: candidates } = await supabase.from("candidates").select("id, user_id");
    if (!candidates || candidates.length === 0) { toast({ title: "No data" }); setExporting(""); return; }

    const userIds = candidates.map(c => c.user_id);
    const candidateIds = candidates.map(c => c.id);
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
    const { data: logs } = await supabase.from("daily_submission_logs").select("candidate_id, applications_count").in("candidate_id", candidateIds);
    const { data: jobs } = await supabase.from("job_postings").select("candidate_id").in("candidate_id", candidateIds);
    const { data: interviews } = await supabase.from("interview_logs").select("candidate_id").in("candidate_id", candidateIds);
    const { data: clicks } = await supabase.from("training_clicks").select("candidate_id").in("candidate_id", candidateIds);

    const rows = candidates.map(c => {
      const prof = profiles?.find(p => p.user_id === c.user_id);
      return {
        candidate_name: prof?.full_name || "",
        total_submissions: (logs || []).filter(l => l.candidate_id === c.id).reduce((s, l) => s + l.applications_count, 0),
        job_links: (jobs || []).filter(j => j.candidate_id === c.id).length,
        interviews: (interviews || []).filter(i => i.candidate_id === c.id).length,
        training_clicks: (clicks || []).filter(t => t.candidate_id === c.id).length,
      };
    });

    downloadCSV(rows, "candidate-activity.csv");
    toast({ title: "Activity exported" });
    setExporting("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Candidate Pipeline Export</CardTitle>
          <CardDescription>Name, status, assigned recruiters, dates.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={exportPipeline} disabled={exporting === "pipeline"}>
            <Download className="mr-2 h-4 w-4" /> {exporting === "pipeline" ? "Exporting..." : "Export CSV"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recruiter Productivity Export</CardTitle>
          <CardDescription>Assigned candidates, submission totals, interviews logged.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={exportRecruiterProductivity} disabled={exporting === "productivity"}>
            <Download className="mr-2 h-4 w-4" /> {exporting === "productivity" ? "Exporting..." : "Export CSV"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Candidate Activity Export</CardTitle>
          <CardDescription>Per-candidate submissions, jobs, interviews, training clicks.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={exportCandidateActivity} disabled={exporting === "activity"}>
            <Download className="mr-2 h-4 w-4" /> {exporting === "activity" ? "Exporting..." : "Export CSV"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReportsPage;
