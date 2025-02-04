import { readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { date: string } }
) {
  try {
    const date = await Promise.resolve(params.date);
    const filePath = join(process.cwd(), "cache", "racing", `${date}.json`);
    const fileContents = await readFile(filePath, "utf8");
    return NextResponse.json(JSON.parse(fileContents));
  } catch (error) {
    return new Response("Not found", { status: 404 });
  }
}
