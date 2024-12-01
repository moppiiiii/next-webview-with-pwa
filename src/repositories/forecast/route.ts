import { CLIENT_PATHS } from "@/constants/clientPaths";
import { fetcher } from "@/libs/fetcher";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import getUrl from "./_libs/getUrl";
import { type ForecastResponse, ForecastResponseSchema } from "./type";

export const dynamic = "force-static";

export async function GET() {
  const forecastUrl = getUrl({ latitude: 34.7022887, longitude: 135.4953509 });

  const forecastResponse = await fetcher<ForecastResponse>(forecastUrl);

  const parsed = ForecastResponseSchema.safeParse(forecastResponse);

  if (!parsed.success) {
    return redirect(CLIENT_PATHS.BAD_REQUEST);
  }

  return NextResponse.json(parsed.data, { status: 200 });
}
