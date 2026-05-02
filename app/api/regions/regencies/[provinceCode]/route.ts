import { NextResponse } from "next/server";

const REGIONS_API_BASE_URL = "https://wilayah.id/api";

type RemoteRegion = {
  code: string;
  name: string;
};

export async function GET(
  _request: Request,
  { params }: { params: { provinceCode: string } }
) {
  try {
    const response = await fetch(
      `${REGIONS_API_BASE_URL}/regencies/${encodeURIComponent(params.provinceCode)}.json`,
      {
        next: { revalidate: 60 * 60 * 24 }
      }
    );

    if (!response.ok) {
      throw new Error("Gagal mengambil data kota / kabupaten.");
    }

    const payload = (await response.json()) as { data?: RemoteRegion[] };

    return NextResponse.json({
      data: payload.data ?? []
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data kota / kabupaten."
      },
      { status: 500 }
    );
  }
}
