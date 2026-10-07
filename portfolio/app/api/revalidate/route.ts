import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "REVALIDATE_SECRET not set" }, { status: 501 });
  }

  const url = new URL(request.url);
  const provided = url.searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const slug = url.searchParams.get("slug");

  revalidatePath("/");
  revalidatePath("/projects");
  if (slug) {
    revalidatePath(`/projects/${slug}`);
  } else {
    revalidatePath("/projects", "layout");
  }

  return NextResponse.json({ ok: true, revalidated: true, slug: slug ?? "all" });
}
