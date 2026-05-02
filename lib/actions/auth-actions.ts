"use server";

import { redirect } from "next/navigation";

import { authenticateAdmin, clearAdminSession, createAdminSession } from "@/lib/auth";
import { appendQueryString, toRequiredString } from "@/lib/utils";
import { loginSchema } from "@/lib/validations";

export async function loginAction(formData: FormData) {
  const email = toRequiredString(formData.get("email"));
  const password = toRequiredString(formData.get("password"));

  const parsed = loginSchema.safeParse({ email, password });

  if (!parsed.success) {
    redirect(
      appendQueryString("/admin/login", {
        status: "error",
        message: parsed.error.issues[0]?.message || "Input login tidak valid."
      })
    );
  }

  const admin = await authenticateAdmin(parsed.data.email, parsed.data.password);

  if (!admin) {
    redirect(
      appendQueryString("/admin/login", {
        status: "error",
        message: "Email atau password admin tidak cocok."
      })
    );
  }

  await createAdminSession({
    sub: admin.id,
    email: admin.email,
    name: admin.name
  });

  redirect("/admin");
}

export async function logoutAction() {
  clearAdminSession();
  redirect("/admin/login");
}
