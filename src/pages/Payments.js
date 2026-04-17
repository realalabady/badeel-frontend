import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, DollarSign, CheckCircle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/DashboardLayout";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Payments() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, paymentsRes] = await Promise.all([
          fetch(`${API}/auth/me`, { credentials: "include" }),
          fetch(`${API}/payments`, { credentials: "include" }),
        ]);
        if (!userRes.ok) throw new Error();
        setUser(await userRes.json());
        if (paymentsRes.ok) setPayments(await paymentsRes.json());
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleMarkPaid = async (paymentId) => {
    try {
      const res = await fetch(`${API}/payments/${paymentId}/pay`, {
        method: "PUT",
        credentials: "include",
      });
      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) =>
            p.payment_id === paymentId
              ? { ...p, status: "paid", paid_at: new Date().toISOString() }
              : p,
          ),
        );
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const sidebarItems = [
    {
      icon: CreditCard,
      label: t("payments.title"),
      onClick: () => {},
      active: true,
    },
  ];

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("payments.title")}</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              {t("payments.totalPayments")}
            </p>
            <p className="text-2xl font-bold">{payments.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700">{t("payments.totalPaid")}</p>
            <p className="text-2xl font-bold text-green-700">
              {totalPaid.toFixed(2)} {t("payments.currency")}
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-700">
              {t("payments.totalPending")}
            </p>
            <p className="text-2xl font-bold text-yellow-700">
              {totalPending.toFixed(2)} {t("payments.currency")}
            </p>
          </div>
        </div>

        {/* Payments Table */}
        {payments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t("payments.noPayments")}</p>
          </div>
        ) : (
          <div className="bg-card border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-start p-3">{t("payments.assignment")}</th>
                  <th className="text-start p-3">{t("payments.amount")}</th>
                  <th className="text-start p-3">{t("payments.method")}</th>
                  <th className="text-start p-3">{t("payments.status")}</th>
                  <th className="text-start p-3">{t("payments.date")}</th>
                  <th className="text-start p-3"></th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.payment_id} className="border-t">
                    <td className="p-3">
                      <button
                        onClick={() =>
                          navigate(`/assignments/${payment.assignment_id}`)
                        }
                        className="text-primary hover:underline"
                      >
                        {payment.assignment_id.slice(0, 16)}...
                      </button>
                    </td>
                    <td className="p-3 font-medium">
                      {payment.amount.toFixed(2)} {t("payments.currency")}
                    </td>
                    <td className="p-3">{payment.method || "-"}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          payment.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {payment.status === "paid" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {payment.status === "paid"
                          ? t("payments.paid")
                          : t("payments.pending")}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString(
                        i18n.language === "ar" ? "ar-SA" : "en-US",
                      )}
                    </td>
                    <td className="p-3">
                      {payment.status === "pending" &&
                        payment.payer_id === user.user_id && (
                          <button
                            onClick={() => handleMarkPaid(payment.payment_id)}
                            className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs hover:bg-primary/90"
                          >
                            {t("payments.markPaid")}
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
