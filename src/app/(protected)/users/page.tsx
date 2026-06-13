"use client";

import { useEffect, useState } from "react";
import { fetchUsers, createUser, deleteUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
import { useI18n } from "@/context/i18n-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UsersPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  
  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      // Auto-generate UUID and force role Kaprodi
      const generatedId = crypto.randomUUID();
      await createUser({ id: generatedId, username, password, name, role: "kaprodi" });
      setUsername("");
      setPassword("");
      setName("");
      setOpen(false);
      loadUsers();
    } catch (err) {
      alert(t("usersPage.errCreate"));
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm(t("usersPage.delConfirm"))) return;
    try {
      await deleteUser(userId);
      loadUsers();
    } catch (err) {
      alert(t("usersPage.errDel"));
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              {t("usersPage.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("usersPage.desc")}
            </p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("usersPage.btnAdd")}
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("usersPage.formTitle")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t("usersPage.userLabel")}</Label>
                <Input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t("usersPage.userPh")} />
              </div>
              <div className="space-y-2">
                <Label>{t("usersPage.passLabel")}</Label>
                <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("usersPage.passPh")} />
              </div>
              <div className="space-y-2">
                <Label>{t("usersPage.nameLabel")}</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder={t("usersPage.namePh")} />
              </div>

              <Button disabled={saving} type="submit" className="w-full mt-4 gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {saving ? t("usersPage.saving") : t("usersPage.btnAdd")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("usersPage.colId")}</th>
              <th className="px-4 py-3 font-semibold">{t("usersPage.colUsername")}</th>
              <th className="px-4 py-3 font-semibold">{t("usersPage.colName")}</th>
              <th className="px-4 py-3 font-semibold">{t("usersPage.colRole")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("usersPage.colAction")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{u.id}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.username}</td>
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(u.id)}
                    disabled={u.id === "admin"}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  {t("usersPage.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
