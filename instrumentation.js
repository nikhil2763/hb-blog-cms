// Runs once when the Next.js server boots: opens the MongoDB Atlas connection up front,
// so the first visitor doesn't wait for DNS + TLS setup (several seconds on a cold start).
// The NEXT_RUNTIME check is replaced at build time, which keeps the Node-only DB code out of the Edge bundle.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { connectDB } = await import("./lib/mongodb");
    connectDB()
      .then(() => console.log("✅ MongoDB connection warmed up"))
      .catch((err) => console.error("⚠️  MongoDB warm-up failed:", err.message));
  }
}
