import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { Users, FileText, Settings } from "lucide-react";

const AdminReferralsPage = () => {
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data: refs } = await supabase
      .from("referrals")
      .select("*")
      .order("created_at", { ascending: false });

    if (refs && refs.length > 0) {
      const referrerIds = [...new Set(refs.map((r: any) => r.referrer_id))];
      const { data: cands } = await supabase
        .from("candidates")
        .select("id, user_id")
        .in("id", referrerIds);
      if (cands) {
        const userIds = cands.map((c: any) => c.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);
        setCandidates(cands.map((c: any) => ({
          ...c,
          profile: profiles?.find((p: any) => p.user_id === c.user_id),
        })));
      }
      setReferrals(refs);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("referrals").update({ status: newStatus }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Status updated" }); fetchData(); }
  };

  const handleNotesChange = async (id: string, notes: string) => {
    const { error } = await supabase.from("referrals").update({ notes }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Notes saved" });
  };

  const getReferrerName = (referrerId: string) => {
    const cand = candidates.find((c: any) => c.id === referrerId);
    return cand?.profile?.full_name || "Unknown";
  };

  const STATUSES = ["new", "contacted", "onboarded", "closed"];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> All Referrals</CardTitle>
          <CardDescription>{referrals.length} referral(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-muted-foreground">Loading...</p> :
            referrals.length === 0 ? <p className="text-muted-foreground">No referrals yet.</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referred By</TableHead>
                    <TableHead>Friend Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{getReferrerName(r.referrer_id)}</TableCell>
                      <TableCell>{r.friend_name}</TableCell>
                      <TableCell>{r.friend_email}</TableCell>
                      <TableCell>{r.friend_phone || "—"}</TableCell>
                      <TableCell>
                        <Select value={r.status} onValueChange={v => handleStatusChange(r.id, v)}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Input
                          placeholder="Admin notes"
                          defaultValue={r.notes || ""}
                          onBlur={e => handleNotesChange(r.id, e.target.value)}
                          className="w-40"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReferralsPage;
