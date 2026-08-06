"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import {
  authenticateCustomer,
  clearCustomerSession,
  createCustomerSession,
  registerCustomer
} from "@/lib/customer-auth";
import { appendQueryString, toOptionalString, toRequiredString } from "@/lib/utils";
import {
  customerLoginSchema,
  customerRegisterSchema,
  forgotPasswordRequestSchema
} from "@/lib/validations";

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
        message: result.error || "Akun belum berhasil aktif."
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
      message: "Akun berhasil aktif dan siap dipakai."
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

export async function requestCustomerPasswordResetAction(formData: FormData) {
  const email = toRequiredString(formData.get("email"));
  const phone = toOptionalString(formData.get("phone"));

  const parsed = forgotPasswordRequestSchema.safeParse({
    email,
    phone
  });

  if (!parsed.success) {
    redirect(
      appendQueryString("/forgot-password", {
        status: "error",
        message: parsed.error.issues[0]?.message || "Data permintaan reset belum valid."
      })
    );
  }

  const normalizedEmail = parsed.data.email.toLowerCase();
  const customer = await db.customerUser.findUnique({
    where: { email: normalizedEmail }
  });

  if (customer) {
    await db.contactMessage.create({
      data: {
        name: customer.name || "Permintaan reset kata sandi",
        email: normalizedEmail,
        phone: parsed.data.phone || customer.phone || null,
        message:
          "Permintaan reset kata sandi pelanggan. Mohon bantu tindak lanjut untuk pemulihan akses akun."
      }
    });
  }

  redirect(
    appendQueryString("/forgot-password", {
      status: "success",
      message:
        "Jika email terdaftar, permintaan reset sudah masuk. Untuk bantuan lebih cepat, Anda juga bisa lanjut lewat WhatsApp."
    })
  );
}
