"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Users,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useI18n } from "@/context/i18n-context";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { t, lang, setLang } = useI18n();
  const { isDark, mounted, toggle: toggleTheme } = useTheme();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const result = await login(username.trim(), password);
    setIsLoading(false);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error ?? "Login gagal.");
    }
  };

  const features = [
    {
      icon: TrendingUp,
      title: t("login.feat1Title"),
      desc: t("login.feat1Desc"),
    },
    {
      icon: Users,
      title: t("login.feat2Title"),
      desc: t("login.feat2Desc"),
    },
    {
      icon: ShieldCheck,
      title: t("login.feat3Title"),
      desc: t("login.feat3Desc"),
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* ── Left Hero Panel ── */}
      <div className="relative hidden w-[55%] flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-indigo-900 to-primary/80 p-12 lg:flex">
        {/* decorative blobs */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary blur-3xl" />
        <div className="absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-primary blur-3xl" />

        {/* Brand */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">GradTracker</span>
        </div>

        {/* Hero copy */}
        <div className="relative space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
              {t("login.heroTitle")}
            </p>
            <h2 className="text-4xl font-bold leading-tight text-white">
              {t("login.heroHeading")}
              <br />
              {t("login.heroHeading2")}
              <br />
              <span className="bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">
                {t("login.heroHeading3")}
              </span>
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-white/80">
              {t("login.heroDesc")}
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-white/70">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/50">
          © 2026 GradTracker — Kelompok 9 · Celerates CAMP 4
        </p>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12 relative">
        {/* Toggles on top right */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "id" ? "en" : "id")}
            className="flex items-center gap-2 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground text-sm font-semibold"
            title="Toggle Language"
          >
            <Globe className="h-4 w-4" />
            {lang === "id" ? "ID" : "EN"}
          </button>
          {mounted && (
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Toggle Theme"
            >
              {isDark ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Mobile brand */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center lg:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary-foreground">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">GradTracker</h1>
          <p className="text-sm text-muted-foreground">
            {t("login.heroTitle")}
          </p>
        </div>

        <div className="w-full max-w-sm space-y-6">
          {/* Heading */}
          <div className="hidden lg:block">
            <h2 className="text-2xl font-bold">{t("login.welcome")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("login.welcomeDesc")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">{t("login.username")}</Label>
              <Input
                id="username"
                placeholder={t("login.usernamePlaceholder")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">{t("login.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="h-10 w-full font-semibold"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? t("login.processing") : t("login.loginButton")}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="rounded-xl border border-dashed bg-muted/40 p-4 text-xs text-muted-foreground">
            <p className="mb-2 font-semibold text-foreground">
              {t("login.demo")}
            </p>
            <div className="space-y-1">
              <p>
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                  admin
                </span>{" "}
                /{" "}
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                  admin123
                </span>{" "}
                — Admin
              </p>
              <p>
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                  S001
                </span>{" "}
                /{" "}
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                  student123
                </span>{" "}
                — Mahasiswa
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
