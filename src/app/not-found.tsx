import Link from "next/link";
import { GraduationCap, Home, LogIn, AlertCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-bold text-muted-foreground">
            GradTracker
          </span>
        </div>

        {/* Error display */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-3">
            <AlertCircle className="h-6 w-6 text-muted-foreground/50" />
            <span className="text-8xl font-black tabular-nums text-muted-foreground/20 leading-none">
              404
            </span>
          </div>
          <h1 className="text-2xl font-bold">Halaman tidak ditemukan</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Halaman yang Anda cari tidak ada atau telah dipindahkan. Kembali ke
            dashboard untuk melanjutkan.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex gap-3">
          <Link href="/" className={buttonVariants()}>
            <Home className="mr-1.5 h-4 w-4" />
            Ke Dashboard
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline" })}
          >
            <LogIn className="mr-1.5 h-4 w-4" />
            Login
          </Link>
        </div>

        <p className="text-xs text-muted-foreground/50">
          GradTracker v2.0 · Kelompok 9
        </p>
      </div>
    </div>
  );
}
