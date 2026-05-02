import { NextResponse } from "next/server";

import { handleMidtransNotification } from "@/lib/payments";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Parameters<typeof handleMidtransNotification>[0];

    await handleMidtransNotification(payload);

    return NextResponse.json({
      received: true
    });
  } catch (error) {
    return NextResponse.json(
      {
        received: false,
        message:
          error instanceof Error
            ? error.message
            : "Notifikasi Midtrans gagal diproses."
      },
      {
        status: 400
      }
    );
  }
}
