import dns from "node:dns";
import mongoose from "mongoose";

// Some local/ISP DNS resolvers refuse the SRV lookups needed by mongodb+srv:// URIs.
const PUBLIC_DNS = ["8.8.8.8", "1.1.1.1"];
const isSrvDnsError = (err) => /querySrv|queryTxt/.test(err?.message || "");

// One cached connection, reused across hot reloads and requests.
const cached = globalThis._mongoose || (globalThis._mongoose = { conn: null, promise: null });

async function connect(uri, options) {
  try {
    return await mongoose.connect(uri, options);
  } catch (err) {
    if (!isSrvDnsError(err)) throw err;
    console.warn(`⚠️  System DNS could not resolve the Atlas host (${err.code}). Retrying with public DNS…`);
    dns.setServers(PUBLIC_DNS);
    return mongoose.connect(uri, options);
  }
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add your MongoDB Atlas URI to .env.");
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = connect(uri, {
      dbName: process.env.MONGODB_DB || "blog_cms",
      bufferCommands: false,
      family: 4, // skip slow IPv6 attempts on Windows / mobile networks
      maxPoolSize: 10,
      minPoolSize: 2, // keep warm sockets so requests don't pay for a new TLS handshake
      serverSelectionTimeoutMS: 10000,
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
