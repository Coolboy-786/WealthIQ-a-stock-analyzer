import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "src");
const EXTS = new Set([".ts", ".tsx", ".css", ".mjs"]);

function countLines(dir: string): { total: number; files: number } {
  let total = 0, files = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = countLines(full);
      total += sub.total; files += sub.files;
    } else if (EXTS.has(path.extname(entry.name))) {
      total += fs.readFileSync(full, "utf8").split("\n").length;
      files++;
    }
  }
  return { total, files };
}

// Also count scripts/
function countAll() {
  const src     = countLines(ROOT);
  const scripts = path.join(process.cwd(), "scripts");
  const sc      = fs.existsSync(scripts) ? countLines(scripts) : { total: 0, files: 0 };
  return {
    loc:   src.total + sc.total,
    files: src.files + sc.files,
  };
}

export async function GET() {
  const { loc, files } = countAll();
  return NextResponse.json({ loc, files }, {
    headers: { "Cache-Control": "no-store" },
  });
}
