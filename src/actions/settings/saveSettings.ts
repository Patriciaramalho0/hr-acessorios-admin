"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerActionClient } from "@/lib/supabase/server-action";

const secureUrl = z.union([z.literal(""), z.string().url().refine(value => value.startsWith("https://"))]);
const schema = z.object({
  store_name: z.string().trim().min(1).max(100),
  whatsapp: z.string().transform(value => value.replace(/\D/g, "")).refine(value => /^(?:55)?[1-9]{2}\d{8,9}$/.test(value)),
  contact_email: z.union([z.literal(""), z.string().email()]),
  instagram: secureUrl, facebook: secureUrl,
  hero_title: z.string().trim().max(120), hero_subtitle: z.string().trim().max(300),
  hero_image_url: secureUrl, announcement_text: z.string().trim().max(300),
  shipping_mode: z.enum(["quote", "free", "fixed"]).default("quote"),
  shipping_amount: z.coerce.number().min(0).max(10000).default(0),
});

export async function saveSettings(form: FormData) {
  const client = await createServerActionClient();
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect("/settings?result=invalid");
  const { hero_title, hero_subtitle, hero_image_url, announcement_text, shipping_mode, shipping_amount, ...settings } = parsed.data;
  const { data: current, error: readError } = await client.from("store_settings").select("id,policies").limit(1).maybeSingle();
  if (readError) redirect("/settings?result=error");
  const previousPolicies = current?.policies && typeof current.policies === "object" && !Array.isArray(current.policies) ? current.policies : {};
  const policies = { ...previousPolicies, shipping: { mode: shipping_mode, amount: Math.round(shipping_amount * 100) / 100 } };
  const valuesToSave = { ...settings, policies };
  const result = current ? await client.from("store_settings").update(valuesToSave).eq("id", current.id).select("id").single() : await client.from("store_settings").insert(valuesToSave).select("id").single();
  if (result.error) redirect("/settings?result=error");
  const { data: appearance, error: appearanceError } = await client.from("store_appearance").select("id").limit(1).maybeSingle();
  if (appearanceError) redirect("/settings?result=partial");
  const values = { hero_title, hero_subtitle, hero_image_url: hero_image_url || null, announcement_text, announcement_enabled: form.get("announcement_enabled") === "on", hero_enabled: form.get("hero_enabled") === "on" };
  const saved = appearance ? await client.from("store_appearance").update(values).eq("id", appearance.id).select("id").single() : await client.from("store_appearance").insert(values).select("id").single();
  if (saved.error) redirect("/settings?result=partial");
  revalidatePath("/settings");
  redirect("/settings?result=saved");
}
