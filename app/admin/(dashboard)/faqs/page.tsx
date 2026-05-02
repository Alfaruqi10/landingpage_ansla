import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBanner } from "@/components/shared/status-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteFaqAction, upsertFaqAction } from "@/lib/actions/admin-actions";
import { getAdminFaqsPageData } from "@/lib/data/admin";

type AdminFaqsPageProps = {
  searchParams?: {
    status?: string;
    message?: string;
  };
};

export default async function AdminFaqsPage({ searchParams }: AdminFaqsPageProps) {
  const faqs = await getAdminFaqsPageData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="FAQs"
        title="Kelola pertanyaan yang paling sering ditanyakan"
        description="FAQ membantu pengunjung menyelesaikan keraguan sebelum mereka menghubungi WhatsApp."
      />
      <StatusBanner status={searchParams?.status} message={searchParams?.message} />

      <Card>
        <CardHeader>
          <CardTitle>Tambah FAQ Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertFaqAction} className="grid gap-4">
            <input type="hidden" name="redirectTo" value="/admin/faqs" />
            <div>
              <Label htmlFor="new-faq-question">Pertanyaan</Label>
              <Input id="new-faq-question" name="question" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="new-faq-answer">Jawaban</Label>
              <Textarea id="new-faq-answer" name="answer" className="mt-2 min-h-[120px]" />
            </div>
            <div className="grid gap-4 md:grid-cols-[220px_auto]">
              <div>
                <Label htmlFor="new-faq-sort-order">Urutan Tampil</Label>
                <Input
                  id="new-faq-sort-order"
                  name="sortOrder"
                  type="number"
                  defaultValue={0}
                  className="mt-2"
                />
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-700">
                <input type="checkbox" name="isActive" className="h-4 w-4" defaultChecked />
                FAQ aktif dan tampil di website
              </label>
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Simpan FAQ
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-5">
        {faqs.map((faq) => (
          <Card key={faq.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{faq.question}</CardTitle>
                <p className="mt-2 text-sm text-stone-500">Urutan tampil: {faq.sortOrder}</p>
              </div>
              <Badge variant={faq.isActive ? "default" : "outline"}>
                {faq.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={upsertFaqAction} className="grid gap-4">
                <input type="hidden" name="redirectTo" value="/admin/faqs" />
                <input type="hidden" name="id" value={faq.id} />
                <div>
                  <Label htmlFor={`faq-question-${faq.id}`}>Pertanyaan</Label>
                  <Input
                    id={`faq-question-${faq.id}`}
                    name="question"
                    defaultValue={faq.question}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor={`faq-answer-${faq.id}`}>Jawaban</Label>
                  <Textarea
                    id={`faq-answer-${faq.id}`}
                    name="answer"
                    defaultValue={faq.answer}
                    className="mt-2 min-h-[120px]"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-[220px_auto]">
                  <div>
                    <Label htmlFor={`faq-sort-order-${faq.id}`}>Urutan Tampil</Label>
                    <Input
                      id={`faq-sort-order-${faq.id}`}
                      name="sortOrder"
                      type="number"
                      defaultValue={faq.sortOrder}
                      className="mt-2"
                    />
                  </div>
                  <label className="flex items-center gap-3 rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      name="isActive"
                      className="h-4 w-4"
                      defaultChecked={faq.isActive}
                    />
                    FAQ aktif dan tampil di website
                  </label>
                </div>
                <Button type="submit" className="w-full sm:w-auto">
                  Update FAQ
                </Button>
              </form>
              <form action={deleteFaqAction}>
                <input type="hidden" name="redirectTo" value="/admin/faqs" />
                <input type="hidden" name="id" value={faq.id} />
                <Button type="submit" variant="destructive">
                  Hapus FAQ
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
