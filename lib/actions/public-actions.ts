"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { appendQueryString, toOptionalString, toRequiredString } from "@/lib/utils";
import { contactSchema, leadSchema } from "@/lib/validations";

function buildPublicRedirect(formData: FormData, overrides: Record<string, string>) {
  const redirectTo = toRequiredString(formData.get("redirectTo")) || "/";
  return appendQueryString(redirectTo, overrides);
}

export async function createLeadAction(formData: FormData) {
  const payload = {
    name: toOptionalString(formData.get("name")),
    email: toOptionalString(formData.get("email")),
    phone: toOptionalString(formData.get("phone")),
    source: toRequiredString(formData.get("source"))
  };

  const parsed = leadSchema.safeParse(payload);

  if (!parsed.success) {
    redirect(
      buildPublicRedirect(formData, {
        form: "lead",
        status: "error",
        message: parsed.error.issues[0]?.message || "Lead tidak valid."
      })
    );
  }

  await db.lead.create({
    data: {
      ...parsed.data,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      name: parsed.data.name || null
    }
  });

  revalidatePath("/admin/leads");

  redirect(
    buildPublicRedirect(formData, {
      form: "lead",
      status: "success",
      message: "Terima kasih. Tim kami akan segera menghubungi Anda."
    })
  );
}

export async function createContactMessageAction(formData: FormData) {
  const payload = {
    name: toRequiredString(formData.get("name")),
    email: toRequiredString(formData.get("email")),
    phone: toOptionalString(formData.get("phone")),
    message: toRequiredString(formData.get("message"))
  };

  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    redirect(
      buildPublicRedirect(formData, {
        form: "contact",
        status: "error",
        message: parsed.error.issues[0]?.message || "Pesan tidak valid."
      })
    );
  }

  await db.contactMessage.create({
    data: {
      ...parsed.data,
      phone: parsed.data.phone || null
    }
  });

  revalidatePath("/admin/leads");

  redirect(
    buildPublicRedirect(formData, {
      form: "contact",
      status: "success",
      message: "Pesan Anda sudah terkirim. Kami akan segera membalas."
    })
  );
}
