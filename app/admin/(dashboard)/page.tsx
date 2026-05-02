import { Mail, Package, PanelsTopLeft, Quote, ShoppingBag, Sparkles, Users } from "lucide-react";

import { AdminTrafficChart } from "@/components/admin/admin-traffic-chart";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBanner } from "@/components/shared/status-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminDashboardData } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils";

type AdminDashboardPageProps = {
  searchParams?: {
    status?: string;
    message?: string;
  };
};

export default async function AdminDashboardPage({
  searchParams
}: AdminDashboardPageProps) {
  const { summary, trafficTrend, recentLeads, recentMessages } = await getAdminDashboardData();

  const cards = [
    { label: "Produk", value: summary.productCount, icon: Package },
    { label: "Pesanan", value: summary.orderCount, icon: ShoppingBag },
    { label: "Collections", value: summary.categoryCount, icon: PanelsTopLeft },
    { label: "Testimoni", value: summary.testimonialCount, icon: Quote },
    { label: "FAQ", value: summary.faqCount, icon: Sparkles },
    { label: "Leads", value: summary.leadCount, icon: Users },
    { label: "Pesan", value: summary.contactCount, icon: Mail }
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Ringkasan"
        title="Kontrol landing page dan katalog utama"
        description="Ringkasan cepat untuk melihat performa konten dan data masuk dari form lead serta contact."
      />
      <StatusBanner status={searchParams?.status} message={searchParams?.message} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-stone-500">{card.label}</p>
                <p className="mt-2 text-4xl font-semibold text-stone-900">{card.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-700">
                <card.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <AdminTrafficChart trend={trafficTrend} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentLeads.length > 0 ? (
              recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-stone-900">{lead.name || "Lead tanpa nama"}</p>
                      <p className="text-sm">{lead.email || lead.phone || "-"}</p>
                    </div>
                    <Badge variant="secondary">{lead.source}</Badge>
                  </div>
                  <p className="mt-2 text-sm">{formatDate(lead.createdAt)}</p>
                </div>
              ))
            ) : (
              <p>Belum ada data lead.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pesan Kontak Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMessages.length > 0 ? (
              recentMessages.map((message) => (
                <div
                  key={message.id}
                  className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-stone-900">{message.name}</p>
                      <p className="text-sm">{message.email}</p>
                    </div>
                    <p className="text-sm">{formatDate(message.createdAt)}</p>
                  </div>
                  <p className="mt-3 text-sm">{message.message}</p>
                </div>
              ))
            ) : (
              <p>Belum ada pesan kontak.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
