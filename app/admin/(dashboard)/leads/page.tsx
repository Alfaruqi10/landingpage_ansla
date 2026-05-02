import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBanner } from "@/components/shared/status-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminLeadsPageData } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils";

type AdminLeadsPageProps = {
  searchParams?: {
    status?: string;
    message?: string;
  };
};

export default async function AdminLeadsPage({ searchParams }: AdminLeadsPageProps) {
  const { leads, messages } = await getAdminLeadsPageData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Leads dan pesan"
        title="Lihat form submissions dari website"
        description="Halaman ini menyimpan lead capture dan contact message agar tim mudah follow up calon pembeli."
      />
      <StatusBanner status={searchParams?.status} message={searchParams?.message} />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Data Lead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {leads.length > 0 ? (
              leads.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-stone-900">{lead.name || "Tanpa nama"}</p>
                      <p className="text-sm">{lead.email || lead.phone || "-"}</p>
                    </div>
                    <p className="text-sm">{formatDate(lead.createdAt)}</p>
                  </div>
                  <p className="mt-2 text-sm text-stone-600">Sumber: {lead.source}</p>
                </div>
              ))
            ) : (
              <p>Belum ada lead yang masuk.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pesan Kontak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-stone-900">{message.name}</p>
                      <p className="text-sm">
                        {message.email}
                        {message.phone ? ` / ${message.phone}` : ""}
                      </p>
                    </div>
                    <p className="text-sm">{formatDate(message.createdAt)}</p>
                  </div>
                  <p className="mt-3 text-sm text-stone-700">{message.message}</p>
                </div>
              ))
            ) : (
              <p>Belum ada pesan yang masuk.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
