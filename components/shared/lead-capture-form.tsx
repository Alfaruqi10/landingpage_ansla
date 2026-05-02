import { createLeadAction } from "@/lib/actions/public-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LeadCaptureForm({
  source,
  redirectTo,
  title,
  description,
  compact = false
}: {
  source: string;
  redirectTo: string;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <form action={createLeadAction} className="space-y-4">
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div>
        <h3 className="text-2xl">{title}</h3>
        <p className="mt-2 text-sm text-stone-600">{description}</p>
      </div>
      <div className={compact ? "grid gap-4" : "grid gap-4 md:grid-cols-2"}>
        <div className={compact ? "" : "md:col-span-2"}>
          <Label htmlFor={`${source}-name`}>Nama</Label>
          <Input id={`${source}-name`} name="name" placeholder="Nama Anda" className="mt-2" />
        </div>
        <div>
          <Label htmlFor={`${source}-email`}>Email</Label>
          <Input
            id={`${source}-email`}
            type="email"
            name="email"
            placeholder="email@contoh.com"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor={`${source}-phone`}>Nomor WhatsApp</Label>
          <Input
            id={`${source}-phone`}
            name="phone"
            placeholder="08xxxxxxxxxx"
            className="mt-2"
          />
        </div>
      </div>
      <Button type="submit" className="w-full sm:w-auto">
        Dapatkan Katalog
      </Button>
    </form>
  );
}
