import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface PendingUser {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  roles: string[];
}

const AdminApprovalsPage = () => {
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPending = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_get_pending_approvals");
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPending((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (userId: string, action: "approved" | "rejected", userName: string, userEmail: string) => {
    setProcessing(userId);
    const { error } = await supabase.rpc("admin_approve_user", {
      _user_id: userId,
      _action: action,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Send email notification
      const emailType = action === "approved" ? "approval_granted" : "approval_rejected";
      supabase.functions.invoke("send-transactional-email", {
        body: { type: emailType, payload: { name: userName, email: userEmail } },
      }).catch(() => {});

      toast({ title: action === "approved" ? "User Approved" : "User Rejected" });
      fetchPending();
    }
    setProcessing(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" /> Pending Approvals ({pending.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : pending.length === 0 ? (
          <p className="text-muted-foreground">No pending registrations.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone || "—"}</TableCell>
                  <TableCell>
                    {u.roles?.map((r) => (
                      <Badge key={r} variant="secondary" className="mr-1">{r}</Badge>
                    ))}
                  </TableCell>
                  <TableCell>{format(new Date(u.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        disabled={processing === u.user_id}
                        onClick={() => handleAction(u.user_id, "approved", u.full_name, u.email)}
                      >
                        <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={processing === u.user_id}
                        onClick={() => handleAction(u.user_id, "rejected", u.full_name, u.email)}
                      >
                        <XCircle className="mr-1 h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminApprovalsPage;
