"use server";

import { redirect } from "next/navigation";

import {
  authenticateCustomer,
  clearCustomerSession,
  createCustomerSession,
  registerCustomer
} from "@/lib/customer-auth";
import { appendQueryString, toOptionalString, toRequiredString } from "@/lib/utils";
import { customerLoginSchema, customerRegisterSchema } from "@/lib/validations";

export async function customerLoginAction(formData: FormData) {
  const email = toRequiredString(formData.get("email"));
  const password = toRequiredString(formData.get("password"));

  const parsed = customerLoginSchema.safeParse({ email, password });

  if (!parsed.success) {
    redirect(
      appendQueryString("/login", {
        status: "error",
        message: parsed.error.issues[0]?.message || "Input login tidak valid."
      })
    );
  }

  const customer = await authenticateCustomer(parsed.data.email, parsed.data.password);

  if (!customer) {
    redirect(
      appendQueryString("/login", {
        status: "error",
        message: "Email atau password belum cocok."
      })
    );
  }

  await createCustomerSession({
    sub: customer.id,
    email: customer.email,
    name: customer.name
  });

  redirect(
    appendQueryString("/account", {
      status: "success",
      message: "Login berhasil. Selamat datang kembali."
    })
  );
}

export async function customerRegisterAction(formData: FormData) {
  const name = toRequiredString(formData.get("name"));
  const email = toRequiredString(formData.get("email"));
  const phone = toOptionalString(formData.get("phone"));
  const password = toRequiredString(formData.get("password"));
  const confirmPassword = toRequiredString(formData.get("confirmPassword"));

  const parsed = customerRegisterSchema.safeParse({
    name,
    email,
    phone,
    password,
    confirmPassword
  });

  if (!parsed.success) {
    redirect(
      appendQueryString("/register", {
        status: "error",
        message: parsed.error.issues[0]?.message || "Data pendaftaran belum valid."
      })
    );
  }

  const result = await registerCustomer({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || undefined,
    password: parsed.data.password
  });

  if (result.error || !result.customer) {
    redirect(
      appendQueryString("/register", {
        status: "error",
        message: result.error || "Akun belum berhasil dibuat."
      })
    );
  }

  await createCustomerSession({
    sub: result.customer.id,
    email: result.customer.email,
    name: result.customer.name
  });

  redirect(
    appendQueryString("/account", {
      status: "success",
      message: "Akun berhasil dibuat dan siap dipakai."
    })
  );
}

export async function customerLogoutAction() {
  clearCustomerSession();
  redirect(
    appendQueryString("/login", {
      status: "success",
      message: "Anda sudah keluar dari akun."
    })
  );
}
