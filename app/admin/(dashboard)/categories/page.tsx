import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ImageSourceFields } from "@/components/admin/image-source-fields";
import { StatusBanner } from "@/components/shared/status-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteCategoryAction,
  upsertCategoryAction
} from "@/lib/actions/admin-actions";
import { getAdminCategoriesPageData } from "@/lib/data/admin";

type AdminCategoriesPageProps = {
  searchParams?: {
    status?: string;
    message?: string;
  };
};

export default async function AdminCategoriesPage({
  searchParams
}: AdminCategoriesPageProps) {
  const categories = await getAdminCategoriesPageData();
  const nextSortOrder =
    categories.length > 0 ? Math.max(...categories.map((category) => category.sortOrder)) + 1 : 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Collections"
        title="Kelola collections katalog"
        description="Collections membantu struktur katalog tetap rapi dan memudahkan filter pada halaman produk."
      />
      <StatusBanner status={searchParams?.status} message={searchParams?.message} />

      <Card>
        <CardHeader>
          <CardTitle>Tambah Collection Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={upsertCategoryAction}
            className="grid gap-4 md:grid-cols-3"
            encType="multipart/form-data"
          >
            <input type="hidden" name="redirectTo" value="/admin/categories" />
            <div>
              <Label htmlFor="new-category-name">Nama</Label>
              <Input id="new-category-name" name="name" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="new-category-slug">Slug</Label>
              <Input id="new-category-slug" name="slug" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="new-category-sort-order">Urutan Tampil</Label>
              <Input
                id="new-category-sort-order"
                name="sortOrder"
                type="number"
                min="0"
                className="mt-2"
                defaultValue={nextSortOrder}
              />
            </div>
            <div className="md:col-span-3">
              <ImageSourceFields baseId="new-category" />
            </div>
            <Button type="submit" className="w-full md:col-span-3 md:w-auto">
              Simpan Collection
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{category.name}</CardTitle>
                <p className="mt-2 text-sm text-stone-500">{category.slug}</p>
                <p className="mt-1 text-sm text-stone-500">Urutan tampil: {category.sortOrder}</p>
              </div>
              <Badge variant="secondary">{category._count.products} produk</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={upsertCategoryAction} className="grid gap-4" encType="multipart/form-data">
                <input type="hidden" name="redirectTo" value="/admin/categories" />
                <input type="hidden" name="id" value={category.id} />
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor={`category-name-${category.id}`}>Nama</Label>
                    <Input
                      id={`category-name-${category.id}`}
                      name="name"
                      defaultValue={category.name}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`category-slug-${category.id}`}>Slug</Label>
                    <Input
                      id={`category-slug-${category.id}`}
                      name="slug"
                      defaultValue={category.slug}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`category-sort-order-${category.id}`}>Urutan Tampil</Label>
                    <Input
                      id={`category-sort-order-${category.id}`}
                      name="sortOrder"
                      type="number"
                      min="0"
                      defaultValue={category.sortOrder}
                      className="mt-2"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <ImageSourceFields
                      baseId={`category-${category.id}`}
                      currentImageUrl={category.imageUrl}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="submit">Update Collection</Button>
                </div>
              </form>
              <form action={deleteCategoryAction}>
                <input type="hidden" name="redirectTo" value="/admin/categories" />
                <input type="hidden" name="id" value={category.id} />
                <Button type="submit" variant="destructive">
                  Hapus Collection
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
