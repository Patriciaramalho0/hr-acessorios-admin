import { createServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { saveSettings } from "@/actions/settings/saveSettings";

export default async function Settings({ searchParams }: { searchParams: { result?: string } }) {
  const client = createServerClient();
  await requireAdmin(client);
  const [settings, appearance] = await Promise.all([
    client.from("store_settings").select("*").limit(1).maybeSingle(),
    client.from("store_appearance").select("*").limit(1).maybeSingle(),
  ]);
  if (settings.error || appearance.error) return <p role="alert">Não foi possível carregar as configurações. Confira as permissões da administradora.</p>;
  const policies = settings.data?.policies as { shipping?: { mode?: string; amount?: number } } | null;
  const fields = [
    ["store_name", "Nome da loja", settings.data?.store_name ?? "HR Acessórios"],
    ["whatsapp", "WhatsApp comercial com DDD", settings.data?.whatsapp ?? "5562984223264"],
    ["contact_email", "E-mail de contato", settings.data?.contact_email ?? ""],
    ["instagram", "URL do Instagram (https)", settings.data?.instagram ?? ""],
    ["facebook", "URL do Facebook (https)", settings.data?.facebook ?? ""],
    ["hero_title", "Título do banner", appearance.data?.hero_title ?? ""],
    ["hero_subtitle", "Texto do banner", appearance.data?.hero_subtitle ?? ""],
    ["hero_image_url", "URL da imagem do banner (https)", appearance.data?.hero_image_url ?? ""],
    ["announcement_text", "Texto do aviso", appearance.data?.announcement_text ?? ""],
  ];
  return <section className="max-w-3xl"><h1 className="mb-6 text-2xl font-semibold">Configurações da loja</h1>
    {searchParams.result && <p role="status" className="mb-4 rounded border p-3">{searchParams.result === "saved" ? "Configurações salvas." : searchParams.result === "partial" ? "Contato salvo, mas o banner não foi salvo. Tente novamente." : "Não foi possível salvar. Confira os campos e as permissões."}</p>}
    <form action={saveSettings} className="space-y-4">
      {fields.map(([name, label, value]) => <label className="block" key={name}><span className="mb-1 block text-sm">{label}</span><input className="w-full rounded border bg-background p-3" name={name} defaultValue={value} maxLength={name === "hero_subtitle" || name === "announcement_text" ? 300 : undefined} /></label>)}
      <label className="flex gap-2"><input type="checkbox" name="hero_enabled" defaultChecked={appearance.data?.hero_enabled ?? true} />Exibir banner</label>
      <label className="flex gap-2"><input type="checkbox" name="announcement_enabled" defaultChecked={appearance.data?.announcement_enabled ?? false} />Exibir aviso</label>
      <label className="block">Frete<select className="mt-1 block w-full rounded border bg-background p-3" name="shipping_mode" defaultValue={policies?.shipping?.mode || "quote"}><option value="quote">A combinar no WhatsApp</option><option value="free">Grátis</option><option value="fixed">Tarifa única</option></select></label>
      <label className="block">Tarifa única (R$)<input className="mt-1 block w-full rounded border bg-background p-3" name="shipping_amount" type="number" min="0" max="10000" step="0.01" defaultValue={policies?.shipping?.amount ?? 0} /></label>
      <p className="text-sm text-muted-foreground">A tarifa única vale para todos os pedidos. Use “a combinar” quando o valor depender do CEP. Não há desconto PIX automático.</p>
      <button className="rounded bg-primary px-5 py-3 text-primary-foreground">Salvar configurações</button>
    </form>
  </section>;
}
