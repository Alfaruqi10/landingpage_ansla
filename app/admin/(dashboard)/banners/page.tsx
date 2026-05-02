import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ImageSourceFields } from "@/components/admin/image-source-fields";
import { StatusBanner } from "@/components/shared/status-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteBannerAction,
  upsertBannerAction
} from "@/lib/actions/admin-actions";
import { getAdminBannersPageData } from "@/lib/data/admin";

type AdminBannersPageProps = {
  searchParams?: {
    status?: string;
    message?: string;
  };
};

export default async function AdminBannersPage({
  searchParams
}: AdminBannersPageProps) {
  const banners = await getAdminBannersPageData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Banner"
        title="Kelola hero banner dan promo copy"
        description="Banner aktif bisa dipakai sebagai visual utama di landing page untuk menyesuaikan campaign yang sedang berjalan."
      />
      <StatusBanner status={searchParams?.status} message={searchParams?.message} />

      <Card>
        <CardHeader>
          <CardTitle>Tambah Banner Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertBannerAction} className="grid gap-4" encType="multipart/form-data">
            <input type="hidden" name="redirectTo" value="/admin/banners" />
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <Label htmlFor="new-banner-title">Judul Banner</Label>
                <Input id="new-banner-title" name="title" className="mt-2" />
              </div>
              <ImageSourceFields baseId="new-banner" required />
              <div className="lg:col-span-2">
                <Label htmlFor="new-banner-subtitle">Subtitle</Label>
                <Textarea
                  id="new-banner-subtitle"
                  name="subtitle"
                  className="mt-2 min-h-[110px]"
                />
              </div>
              <div>
                <Label htmlFor="new-banner-cta-text">CTA Text</Label>
                <Input id="new-banner-cta-text" name="ctaText" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="new-banner-cta-link">CTA Link</Label>
                <Input id="new-banner-cta-link" name="ctaLink" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="new-banner-sort-order">Urutan Tampil</Label>
                <Input
                  id="new-banner-sort-order"
                  name="sortOrder"
                  type="number"
                  defaultValue={0}
                  className="mt-2"
                />
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-700">
                <input type="checkbox" name="isActive" className="h-4 w-4" defaultChecked />
                Banner aktif dan tampil di website
              </label>
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Simpan Banner
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-5">
        {banners.map((banner) => (
          <Card key={banner.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{banner.title}</CardTitle>
                <p className="mt-2 text-sm text-stone-500">Urutan tampil: {banner.sortOrder}</p>
              </div>
              <Badge variant={banner.isActive ? "default" : "outline"}>
                {banner.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={upsertBannerAction} className="grid gap-4" encType="multipart/form-data">
                <input type="hidden" name="redirectTo" value="/admin/banners" />
                <input type="hidden" name="id" value={banner.id} />
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <Label htmlFor={`banner-title-${banner.id}`}>Judul Banner</Label>
                    <Input
                      id={`banner-title-${banner.id}`}
                      name="title"
                      defaultValue={banner.title}
                      className="mt-2"
                    />
                  </div>
                  <ImageSourceFields baseId={`banner-${banner.id}`} currentImageUrl={banner.imageUrl} required />
                  <div className="lg:col-span-2">
                    <Label htmlFor={`banner-subtitle-${banner.id}`}>Subtitle</Label>
                    <Textarea
                      id={`banner-subtitle-${banner.id}`}
                      name="subtitle"
                      defaultValue={banner.subtitle}
                      className="mt-2 min-h-[110px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`banner-cta-text-${banner.id}`}>CTA Text</Label>
                    <Input
                      id={`banner-cta-text-${banner.id}`}
                      name="ctaText"
                      defaultValue={banner.ctaText}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`banner-cta-link-${banner.id}`}>CTA Link</Label>
                    <Input
                      id={`banner-cta-link-${banner.id}`}
                      name="ctaLink"
                      defaultValue={banner.ctaLink}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`banner-sort-order-${banner.id}`}>Urutan Tampil</Label>
                    <Input
                      id={`banner-sort-order-${banner.id}`}
                      name="sortOrder"
                      type="number"
                      defaultValue={banner.sortOrder}
                      className="mt-2"
                    />
                  </div>
                  <label className="flex items-center gap-3 rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      name="isActive"
                      className="h-4 w-4"
                      defaultChecked={banner.isActive}
                    />
                    Banner aktif dan tampil di website
                  </label>
                </div>
                <Button type="submit" className="w-full sm:w-auto">
                  Update Banner
                </Button>
              </form>
              <form action={deleteBannerAction}>
                <input type="hidden" name="redirectTo" value="/admin/banners" />
                <input type="hidden" name="id" value={banner.id} />
                <Button type="submit" variant="destructive">
                  Hapus Banner
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
