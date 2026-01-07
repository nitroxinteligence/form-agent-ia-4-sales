import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl text-center space-y-6">
        <div className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          IA Four Sales
        </div>
        <h1 className="font-display text-4xl font-semibold text-foreground">
          Briefing do seu Agente de IA
        </h1>
        <p className="text-muted-foreground">
          Acesse o formulário completo para criarmos seu Agente sob medida.
        </p>
        <Button asChild size="lg">
          <Link href="/form">Preencher formulário</Link>
        </Button>
      </div>
    </main>
  );
}
