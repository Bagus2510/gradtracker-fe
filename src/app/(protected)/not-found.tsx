import Link from "next/link";
import { AlertCircle, Home, FileSearch } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function ProtectedNotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileSearch className="h-10 w-10 text-muted-foreground/50" />
      </div>
      
      <div className="mt-6 flex items-center justify-center gap-2">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <span className="text-3xl font-black tabular-nums text-foreground/80">
          404
        </span>
      </div>
      
      <h2 className="mt-2 text-xl font-bold">Halaman Tidak Ditemukan</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Maaf, rute yang Anda coba akses tidak tersedia di panel admin ini.
      </p>

      <div className="mt-8 flex gap-3">
        <Link href="/dashboard" className={buttonVariants()}>
          <Home className="mr-2 h-4 w-4" />
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
