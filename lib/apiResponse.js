import { NextResponse } from "next/server";
import { HttpError } from "./blogService";
import { getAdmin } from "./session";

export function errorResponse(err) {
  if (err instanceof HttpError) {
    return NextResponse.json({ error: err.message, errors: err.errors }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: "Something went wrong on the server." }, { status: 500 });
}

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
}

// Second check behind the middleware so write routes never run without a session.
export async function assertAdmin() {
  if (!(await getAdmin())) throw new HttpError(401, "Please log in as admin.");
}
