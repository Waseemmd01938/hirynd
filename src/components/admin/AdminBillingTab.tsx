import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, DollarSign, Plus, RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface AdminBillingTabProps {
  candidateId: string;
  onRefresh: () => void;
}

const AdminBillingTab = ({ candidateId, onRefresh }: AdminBillingTabProps) => {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create subscription form
  const [createAmount, setCreateAmount] = useState("");
  const [createStatus, setCreateStatus] = useState("active");
  const [creating, setCreating] = useState(false);

  // Record payment form
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("manual");
  const [payStatus, setPayStatus] = useState("success");
  const [recording, setRecording] = useState(false);

  // Status change
  const [newStatus, setNewStatus] = useState("");
  const [changingStatus, setChangingStatus] = useState(false);

  // Grace period
  const [graceDays, setGraceDays] = useState("5");
  const [extendingGrace, setExtendingGrace] = useState(false);

  // Billing check
  const [runningCheck, setRunningCheck] = useState(false);

  const fetchBilling = async () => {
    const [subRes, payRes] = await Promise.all([
      supabase.from("candidate_subscriptions").select("*").eq("candidate_id", candidateId).maybeSingle(),
      supabase.from("subscription_payments").select("*").eq("candidate_id", candidateId).order("created_at", { ascending: false }),
    ]);
    setSubscription(subRes.data);
    setPayments(payRes.data || []);
    if (subRes.data) setNewStatus(subRes.data.status);
    setLoading(false);
  };

  useEffect(() => { fetchBilling(); }, [candidateId]);

  const handleCreate = async () => {
    if (!createAmount || Number(createAmount) <= 0) { toast({ title: "Enter a valid amount", variant: "destructive" }); return; }
    setCreating(true);
    const { error } = await supabase.rpc("admin_create_subscription", {
      _candidate_id: candidateId, _amount: Number(createAmount), _status: createStatus,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Subscription created" }); setCreateAmount(""); fetchBilling(); onRefresh(); }
    setCreating(false);
  };

  const handleRecordPayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) { toast({ title: "Enter a valid amount", variant: "destructive" }); return; }
    setRecording(true);
    const { error } = await supabase.rpc("admin_record_subscription_payment", {
      _candidate_id: candidateId, _amount: Number(payAmount), _payment_status: payStatus, _payment_method: payMethod,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Payment recorded" }); setPayAmount(""); fetchBilling(); onRefresh(); }
    setRecording(false);
  };

  const handleStatusChange = async () => {
    if (!newStatus || newStatus === subscription?.status) return;
    setChangingStatus(true);
    const { error } = await supabase.rpc("admin_update_subscription_status", {
      _candidate_id: candidateId, _new_status: newStatus,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Status updated" }); fetchBilling(); onRefresh(); }
    setChangingStatus(false);
  };

  const handleExtendGrace = async () => {
    setExtendingGrace(true);
    const { error } = await supabase.rpc("admin_extend_grace_period", {
      _candidate_id: candidateId, _days: Number(graceDays),
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Grace period extended" }); fetchBilling(); }
    setExtendingGrace(false);
  };

  const handleBillingCheck = async () => {
    setRunningCheck(true);
    const { data, error } = await supabase.rpc("run_billing_checks");
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      const result = data as any;
      toast({ title: "Billing check complete", description: `Expired grace periods paused: ${result?.expired_grace || 0}` });
      fetchBilling(); onRefresh();
    }
    setRunningCheck(false);
  };

  if (loading) return <p className="text-muted-foreground">Loading billing...</p>;

  const statusBadgeClass: Record<string, string> = {
    active: "bg-secondary/10 text-secondary",
    trialing: "bg-primary/10 text-primary",
    past_due: "bg-destructive/10 text-destructive",
    canceled: "bg-muted text-muted-foreground",
    unpaid: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="space-y-4">
      {/* Run Billing Checks */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleBillingCheck} disabled={runningCheck}>
          <RefreshCw className={`mr-2 h-4 w-4 ${runningCheck ? "animate-spin" : ""}`} />
          {runningCheck ? "Running..." : "Run Billing Checks"}
        </Button>
      </div>

      {!subscription ? (
        /* Create Subscription */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Create Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Monthly Amount ($) *</Label><Input type="number" min="1" value={createAmount} onChange={e => setCreateAmount(e.target.value)} placeholder="499" /></div>
              <div><Label>Initial Status</Label>
                <Select value={createStatus} onValueChange={setCreateStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trialing">Trialing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="hero" onClick={handleCreate} disabled={creating}>{creating ? "Creating..." : "Create Subscription"}</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Subscription Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={statusBadgeClass[subscription.status] || ""}>{subscription.status.replace(/_/g, " ").toUpperCase()}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-bold text-card-foreground">${Number(subscription.amount).toLocaleString()}/mo</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Billing</p>
                  <p className="text-card-foreground">{subscription.next_billing_at ? new Date(subscription.next_billing_at).toLocaleDateString() : "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Payment</p>
                  <p className="text-card-foreground">{subscription.last_payment_at ? new Date(subscription.last_payment_at).toLocaleDateString() : "—"}</p>
                </div>
                {subscription.grace_period_ends_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Grace Period Ends</p>
                    <p className="text-destructive font-semibold">{new Date(subscription.grace_period_ends_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {/* Status Change */}
              <div className="flex items-end gap-3 border-t border-border pt-4">
                <div className="flex-1">
                  <Label>Change Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["trialing", "active", "past_due", "canceled", "unpaid"].map(s => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleStatusChange} disabled={changingStatus || newStatus === subscription.status}>
                  {changingStatus ? "Updating..." : "Update Status"}
                </Button>
              </div>

              {/* Extend Grace */}
              {subscription.status === "past_due" && (
                <div className="flex items-end gap-3 border-t border-border pt-4 mt-4">
                  <div>
                    <Label>Extend Grace (days)</Label>
                    <Input type="number" min="1" max="30" value={graceDays} onChange={e => setGraceDays(e.target.value)} className="w-24" />
                  </div>
                  <Button variant="outline" onClick={handleExtendGrace} disabled={extendingGrace}>
                    {extendingGrace ? "Extending..." : "Extend Grace Period"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Record Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Record Subscription Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div><Label>Amount ($) *</Label><Input type="number" min="1" value={payAmount} onChange={e => setPayAmount(e.target.value)} /></div>
                <div><Label>Status</Label>
                  <Select value={payStatus} onValueChange={setPayStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Method</Label>
                  <Select value={payMethod} onValueChange={setPayMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="razorpay">Razorpay</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button variant="hero" onClick={handleRecordPayment} disabled={recording || !payAmount}>
                {recording ? "Recording..." : "Record Payment"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-muted-foreground">No subscription payments recorded.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">${Number(p.amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {p.payment_status === "success" ? <CheckCircle className="h-3.5 w-3.5 text-secondary" /> :
                         p.payment_status === "failed" ? <XCircle className="h-3.5 w-3.5 text-destructive" /> :
                         <Clock className="h-3.5 w-3.5 text-muted-foreground" />}
                        <span className="capitalize text-sm">{p.payment_status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-sm text-muted-foreground">{p.payment_method}</TableCell>
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

export default AdminBillingTab;
