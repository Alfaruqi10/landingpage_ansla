import { createContactMessageAction } from "@/lib/actions/public-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm({ redirectTo }: { redirectTo: string }) {
  return (
    <form action={createContactMessageAction} className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Nama</Label>
          <Input id="contact-name" name="name" placeholder="Nama lengkap" className="mt-2" />
        </div>
        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            name="email"
            placeholder="email@contoh.com"
            className="mt-2"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="contact-phone">Nomor WhatsApp</Label>
          <Input
            id="contact-phone"
            name="phone"
            placeholder="08xxxxxxxxxx"
            className="mt-2"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="contact-message">Pesan</Label>
          <Textarea
            id="contact-message"
            name="message"
            placeholder="Tulis pertanyaan atau kebutuhan Anda di sini..."
            className="mt-2 min-h-[140px] sm:min-h-[170px]"
          />
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-muted-foreground">
          Isi minimal nama, email, dan pesan supaya kebutuhan Anda bisa dipahami dengan jelas.
        </p>
        <Button type="submit" className="w-full sm:min-w-[160px] sm:w-auto">
          Kirim Pesan
        </Button>
      </div>
    </form>
  );
}
