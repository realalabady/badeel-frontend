import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users,
  Search,
  ArrowRight,
  Shield,
  GraduationCap,
  School,
  User as UserIcon,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ROLES = ["admin", "school_admin", "teacher", "student", "guardian"];

const RoleIcon = ({ role }) => {
  const icons = {
    admin: Shield,
    school_admin: School,
    teacher: GraduationCap,
    student: UserIcon,
    guardian: Users,
  };
  const Icon = icons[role] || UserIcon;
  return <Icon className="w-4 h-4" />;
};

const RoleBadge = ({ role, t }) => {
  const colors = {
    admin: "bg-red-100 text-red-800 border-red-200",
    school_admin: "bg-purple-100 text-purple-800 border-purple-200",
    teacher: "bg-blue-100 text-blue-800 border-blue-200",
    student: "bg-green-100 text-green-800 border-green-200",
    guardian: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${
        colors[role] || "bg-gray-100 text-gray-800 border-gray-200"
      }`}
    >
      <RoleIcon role={role} />
      {t(`roles.${role}`)}
    </span>
  );
};

const emptyForm = { name: "", email: "", role: "student", phone: "", city: "" };

export default function UserManagement() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/users`, { credentials: "include" });
      if (res.ok) setUsers(await res.json());
    } catch {}
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch(`${API}/auth/me`, {
          credentials: "include",
        });
        const userData = await userResponse.json();
        setUser(userData);
        await fetchUsers();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || t("common.error"));
      }
      const newUser = await res.json();
      setUsers((prev) => [...prev, newUser]);
      setShowCreate(false);
      setFormData(emptyForm);
      setSuccess(t("userManagement.userCreated"));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API}/users/${showEdit}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || t("common.error"));
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === showEdit ? { ...u, ...formData } : u,
        ),
      );
      setShowEdit(null);
      setFormData(emptyForm);
      setSuccess(t("userManagement.userUpdated"));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API}/users/${showDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || t("common.error"));
      }
      setUsers((prev) => prev.filter((u) => u.user_id !== showDelete));
      setShowDelete(null);
      setSuccess(t("userManagement.userDeleted"));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (u) => {
    setFormData({
      name: u.name || "",
      email: u.email || "",
      role: u.role || "student",
      phone: u.phone || "",
      city: u.city || "",
    });
    setShowEdit(u.user_id);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      searchQuery === "" ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const sidebarItems = user
    ? [
        {
          icon: ArrowRight,
          label: t("common.back"),
          onClick: () => navigate("/admin"),
        },
      ]
    : [];

  if (loading || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const FormModal = ({ title, onSubmit, onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md" dir={isRTL ? "rtl" : "ltr"}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-bold text-primary">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t("auth.name")}</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("auth.email")}</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("auth.role")}</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-white"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{t(`roles.${r}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("auth.phone")}</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("auth.city")}</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 btn-primary py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {submitting ? t("common.loading") : t("common.save")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border py-2 rounded-lg text-sm hover:bg-muted/30"
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div
        className="fade-in"
        dir={isRTL ? "rtl" : "ltr"}
        data-testid="user-management-page"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              {t("userManagement.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("userManagement.subtitle")}
            </p>
          </div>
          <button
            onClick={() => { setFormData(emptyForm); setShowCreate(true); }}
            className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("userManagement.createUser")}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 mb-6 text-sm">
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-border rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className={`absolute top-3 w-5 h-5 text-muted-foreground ${
                  isRTL ? "right-3" : "left-3"
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-10 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                  isRTL ? "pr-10" : "pl-10"
                }`}
                placeholder={t("userManagement.searchPlaceholder")}
              />
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
              >
                <option value="all">{t("common.all")}</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {t(`roles.${role}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-start text-sm font-medium text-primary">
                    {t("userManagement.user")}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-primary">
                    {t("userManagement.email")}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-primary">
                    {t("userManagement.role")}
                  </th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-primary">
                    {t("userManagement.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      {t("userManagement.noUsers")}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.user_id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {u.picture ? (
                            <img
                              src={u.picture}
                              alt={u.name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-primary" />
                            </div>
                          )}
                          <span className="font-medium text-primary">
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {u.email}
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={u.role} t={t} />
                      </td>
                      <td className="px-4 py-3">
                        {u.user_id === user.user_id ? (
                          <span className="text-xs text-muted-foreground">
                            {t("userManagement.cantChangeOwn")}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(u)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                              title={t("common.edit")}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowDelete(u.user_id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                              title={t("common.delete")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-muted-foreground">
          {t("userManagement.showing", {
            count: filteredUsers.length,
            total: users.length,
          })}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <FormModal
          title={t("userManagement.createUser")}
          onSubmit={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Edit Modal */}
      {showEdit && (
        <FormModal
          title={t("userManagement.editUser")}
          onSubmit={handleEdit}
          onClose={() => setShowEdit(null)}
        />
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6" dir={isRTL ? "rtl" : "ltr"}>
            <h3 className="text-lg font-bold text-primary mb-2">
              {t("userManagement.confirmDelete")}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("userManagement.deleteWarning")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? t("common.loading") : t("common.delete")}
              </button>
              <button
                onClick={() => setShowDelete(null)}
                className="flex-1 border border-border py-2 rounded-lg text-sm hover:bg-muted/30"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
