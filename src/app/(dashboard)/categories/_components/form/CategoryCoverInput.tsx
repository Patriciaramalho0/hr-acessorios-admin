"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { Control } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { CategoryFormData } from "./schema";

export default function CategoryCoverInput({ control }: { control: Control<CategoryFormData> }) {
  const image = useWatch({ control, name: "image" });
  const [preview, setPreview] = useState<string>();
  const input = useRef<HTMLInputElement | null>(null);
  const id = useId();
  useEffect(() => {
    if (image instanceof File) {
      const url = URL.createObjectURL(image);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(typeof image === "string" ? image : undefined);
  }, [image]);
  return <FormField control={control} name="image" render={({ field }) => <FormItem>
    <FormLabel htmlFor={id}>Imagem de capa</FormLabel>
    <FormControl><input id={id} type="file" accept="image/jpeg,image/png,image/webp" className="block w-full rounded border p-3 text-sm" ref={element => { input.current = element; field.ref(element); }} onChange={event => {
      const file = event.target.files?.[0];
      if (file) field.onChange(file);
    }} /></FormControl>
    <p className="text-xs text-muted-foreground">Opcional. JPG, PNG ou WebP de até 3 MB. Prefira uma imagem quadrada.</p>
    {preview && <div className="flex items-center gap-4">
      <img src={preview} alt="Prévia da capa da categoria" className="h-24 w-24 rounded-full border object-cover" />
      <button type="button" className="text-sm text-destructive underline" onClick={() => { field.onChange(null); if (input.current) input.current.value = ""; }}>Remover capa</button>
    </div>}
    <FormMessage />
  </FormItem>} />;
}
