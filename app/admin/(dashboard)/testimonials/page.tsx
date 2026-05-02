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
  deleteTestimonialAction,
  upsertTestimonialAction
} from "@/lib/actions/admin-actions";
import { getAdminTestimonialsPageData } from "@/lib/data/admin";

type AdminTestimonialsPageProps = {
  searchParams?: {
    status?: string;
    message?: string;
  };
};

export default async function AdminTestimonialsPage({
  searchParams
}: AdminTestimonialsPageProps) {
  const testimonials = await getAdminTestimonialsPageData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Testimoni"
        title="Kelola social proof pelanggan"
        description="Testimonial aktif akan tampil di landing page untuk memperkuat trust dari calon pembeli."
      />
      <StatusBanner status={searchParams?.status} message={searchParams?.message} />

      <Card>
        <CardHeader>
          <CardTitle>Tambah Testimonial Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={upsertTestimonialAction}
            className="grid gap-4"
            encType="multipart/form-data"
          >
            <input type="hidden" name="redirectTo" value="/admin/testimonials" />
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <Label htmlFor="new-testimonial-name">Nama</Label>
                <Input id="new-testimonial-name" name="name" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="new-testimonial-city">Kota</Label>
                <Input id="new-testimonial-city" name="city" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="new-testimonial-rating">Rating</Label>
                <Input
                  id="new-testimonial-rating"
                  name="rating"
                  type="number"
                  min="1"
                  max="5"
                  className="mt-2"
                />
              </div>
              <ImageSourceFields baseId="new-testimonial" />
              <div className="lg:col-span-2">
                <Label htmlFor="new-testimonial-content">Content</Label>
                <Textarea
                  id="new-testimonial-content"
                  name="content"
                  className="mt-2 min-h-[120px]"
                />
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-700">
                <input type="checkbox" name="isActive" className="h-4 w-4" defaultChecked />
                Testimoni aktif dan tampil di website
              </label>
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Simpan Testimonial
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{testimonial.name}</CardTitle>
                <p className="mt-2 text-sm text-stone-500">{testimonial.city || "Indonesia"}</p>
              </div>
              <Badge variant={testimonial.isActive ? "default" : "outline"}>
                {testimonial.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={upsertTestimonialAction} className="grid gap-4" encType="multipart/form-data">
                <input type="hidden" name="redirectTo" value="/admin/testimonials" />
                <input type="hidden" name="id" value={testimonial.id} />
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <Label htmlFor={`testimonial-name-${testimonial.id}`}>Nama</Label>
                    <Input
                      id={`testimonial-name-${testimonial.id}`}
                      name="name"
                      defaultValue={testimonial.name}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`testimonial-city-${testimonial.id}`}>Kota</Label>
                    <Input
                      id={`testimonial-city-${testimonial.id}`}
                      name="city"
                      defaultValue={testimonial.city ?? ""}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`testimonial-rating-${testimonial.id}`}>Rating</Label>
                    <Input
                      id={`testimonial-rating-${testimonial.id}`}
                      name="rating"
                      type="number"
                      min="1"
                      max="5"
                      defaultValue={testimonial.rating}
                      className="mt-2"
                    />
                  </div>
                  <ImageSourceFields
                    baseId={`testimonial-${testimonial.id}`}
                    currentImageUrl={testimonial.imageUrl}
                  />
                  <div className="lg:col-span-2">
                    <Label htmlFor={`testimonial-content-${testimonial.id}`}>Content</Label>
                    <Textarea
                      id={`testimonial-content-${testimonial.id}`}
                      name="content"
                      defaultValue={testimonial.content}
                      className="mt-2 min-h-[120px]"
                    />
                  </div>
                  <label className="flex items-center gap-3 rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      name="isActive"
                      className="h-4 w-4"
                      defaultChecked={testimonial.isActive}
                    />
                    Testimoni aktif dan tampil di website
                  </label>
                </div>
                <Button type="submit" className="w-full sm:w-auto">
                  Update Testimonial
                </Button>
              </form>
              <form action={deleteTestimonialAction}>
                <input type="hidden" name="redirectTo" value="/admin/testimonials" />
                <input type="hidden" name="id" value={testimonial.id} />
                <Button type="submit" variant="destructive">
                  Hapus Testimonial
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
