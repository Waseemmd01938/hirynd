import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, FileText, CreditCard, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";

const CANDIDATE_NAV = [
  { label: "Overview", path: "/candidate-dashboard", icon: <span className="h-4 w-4">📋</span> },
  { label: "Intake Form", path: "/candidate-dashboard/intake", icon: <FileText className="h-4 w-4" /> },
  { label: "Roles", path: "/candidate-dashboard/roles", icon: <span className="h-4 w-4">💼</span> },
  { label: "Credentials", path: "/candidate-dashboard/credentials", icon: <span className="h-4 w-4">🔑</span> },
  { label: "Payments", path: "/candidate-dashboard/payments", icon: <DollarSign className="h-4 w-4" /> },
  { label: "Billing", path: "/candidate-dashboard/billing", icon: <CreditCard className="h-4 w-4" /> },
];

interface CandidateBillingPageProps {
  candidate: any;
}

const statusColors: Record<string, string> = {
  active: "bg-secondary/10 text-secondary border-secondary/30",
  trialing: "bg-primary/10 text-primary border-primary/30",
  past_due: "bg-destructive/10 text-destructive border-destructive/30",
  canceled: "bg-muted text-muted-foreground border-border",
  unpaid: "bg-destructive/10 text-destructive border-destructive/30",
};

const CandidateBillingPage = ({ candidate }: CandidateBillingPageProps) => {
  const [subscription, setSubscription] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidate) return;
    const fetchBilling = async () => {
      const [subRes, payRes] = await Promise.all([
        supabase.from("candidate_subscriptions").select("*").eq("candidate_id", candidate.id).maybeSingle(),
        supabase.from("subscription_payments").select("*").eq("candidate_id", candidate.id).order("created_at", { ascending: false }),
      ]);
      setSubscription(subRes.data);
      setPayments(payRes.data || []);
      setLoading(false);
    };
    fetchBilling();
  }, [candidate]);

  const graceRemaining = () => {
    if (!subscription?.grace_period_ends_at) return null;
    const diff = new Date(subscription.grace_period_ends_at).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const days = Math.ceil(diff / 86400000);
    return `${days} day${days !== 1 ? "s" : ""} remaining`;
  };

  return (
    <DashboardLayout title="Billing & Subscription" navItems={CANDIDATE_NAV}>
      {/* Past Due Banner */}
      {subscription?.status === "past_due" && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <div>
              <p className="font-semibold text-card-foreground">Payment Past Due</p>
              <p className="text-sm text-muted-foreground">
                Please update your payment method to avoid marketing disruption.
                {graceRemaining() && ` Grace period: ${graceRemaining()}.`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {subscription?.status === "canceled" && (
        <Card className="mb-6 border-muted bg-muted/30">
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="font-semibold text-card-foreground">Subscription Canceled</p>
              <p className="text-sm text-muted-foreground">Your subscription has been canceled. Contact support to reactivate.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Subscription Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : !subscription ? (
            <p className="text-muted-foreground">No active subscription. Your admin team will set this up when your account is ready.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={statusColors[subscription.status] || ""}>
                  {subscription.status.replace(/_/g, " ").toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Amount</p>
                <p className="text-lg font-bold text-card-foreground">${Number(subscription.amount).toLocaleString()} {subscription.currency}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Billing</p>
                <p className="text-card-foreground">{subscription.next_billing_at ? new Date(subscription.next_billing_at).toLocaleDateString() : "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Payment</p>
                <p className="text-card-foreground">{subscription.last_payment_at ? new Date(subscription.last_payment_at).toLocaleDateString() : "—"}</p>
              </div>
              {subscription.status === "past_due" && subscription.grace_period_ends_at && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Grace Period Ends</p>
                  <p className="text-destructive font-semibold">
                    {new Date(subscription.grace_period_ends_at).toLocaleDateString()} ({graceRemaining()})
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-muted-foreground">No billing records yet.</p>
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
                    <TableCell className="font-medium">${Number(p.amount).toLocaleString()} {p.currency}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {p.payment_status === "success" ? <CheckCircle className="h-3.5 w-3.5 text-secondary" /> :
                         p.payment_status === "failed" ? <XCircle className="h-3.5 w-3.5 text-destructive" /> :
                         <Clock className="h-3.5 w-3.5 text-muted-foreground" />}
                        <span className="capitalize text-sm">{p.payment_status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm capitalize text-muted-foreground">{p.payment_method}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default CandidateBillingPage;
