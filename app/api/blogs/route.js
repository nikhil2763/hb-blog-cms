import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { listBlogs, createBlog } from "@/lib/blogService";
import { assertAdmin, errorResponse, readJson } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ blogs: await listBlogs() });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req) {
  try {
    await assertAdmin();
    const blog = await createBlog(await readJson(req));
    revalidatePath("/blog");
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ blog }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
