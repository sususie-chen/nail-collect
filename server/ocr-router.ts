import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execAsync = promisify(exec);

function base64ToBuffer(dataUrl: string): { buffer: Buffer; ext: string } {
  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid base64 data URL");
  }
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const buffer = Buffer.from(match[2], "base64");
  return { buffer, ext };
}

function cleanupTempFile(filePath: string) {
  try {
    fs.unlinkSync(filePath);
  } catch {
    // ignore cleanup errors
  }
}

async function runOCR(imagePath: string): Promise<string> {
  // Try with english first (always available)
  try {
    const { stdout } = await execAsync(
      `tesseract "${imagePath}" stdout -l eng --psm 6 2>/dev/null`,
      { timeout: 15000 }
    );
    return stdout;
  } catch {
    // Fallback to default
    try {
      const { stdout } = await execAsync(
        `tesseract "${imagePath}" stdout --psm 6 2>/dev/null`,
        { timeout: 15000 }
      );
      return stdout;
    } catch {
      return "";
    }
  }
}

function extractProductInfo(text: string): { brand?: string; shadeCode?: string; shadeName?: string } {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let brand: string | undefined;
  let shadeCode: string | undefined;
  let shadeName: string | undefined;

  // Extract English brand names (uppercase patterns like MAGICCOLORNAIL, OPI, CND)
  const brandPattern = /\b([A-Z]{2,}[A-Z0-9]*(?:\s+[A-Z]{2,}[A-Z0-9]*)*)\b/;
  const numberPattern = /\b(\d{1,4}[A-Z]{0,2})\b/;
  const fullPattern = /(.+?)\s*[-·,]\s*(.+)/;

  for (const line of lines) {
    // Look for lines with separators (-, ·, comma)
    const sepMatch = line.match(fullPattern);
    if (sepMatch) {
      const left = sepMatch[1].trim();
      const right = sepMatch[2].trim();
      if (!brand && left.length > 1) brand = left;
      if (!shadeCode && right.length > 0) shadeCode = right;
    }

    // Look for brand names (all caps or title case)
    const brandMatch = line.match(brandPattern);
    if (brandMatch && !brand && brandMatch[1].length > 1) {
      brand = brandMatch[1];
    }

    // Look for numbers/shade codes
    const numMatch = line.match(numberPattern);
    if (numMatch && !shadeCode && numMatch[1].length > 0) {
      shadeCode = numMatch[1];
    }
  }

  return { brand, shadeCode, shadeName };
}

export const ocrRouter = createRouter({
  recognize: authedQuery
    .input(
      z.object({
        imageData: z.string(), // base64 data URL
      })
    )
    .mutation(async ({ input }) => {
      const { buffer, ext } = base64ToBuffer(input.imageData);
      const tmpFile = path.join(os.tmpdir(), `ocr-${Date.now()}.${ext}`);

      try {
        fs.writeFileSync(tmpFile, buffer);
        const text = await runOCR(tmpFile);
        const info = extractProductInfo(text);
        return {
          rawText: text,
          ...info,
        };
      } finally {
        cleanupTempFile(tmpFile);
      }
    }),

  recognizeBatch: authedQuery
    .input(
      z.object({
        images: z.array(z.string()), // array of base64 data URLs
      })
    )
    .mutation(async ({ input }) => {
      const results = [];
      for (const imageData of input.images) {
        const { buffer, ext } = base64ToBuffer(imageData);
        const tmpFile = path.join(os.tmpdir(), `ocr-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);

        try {
          fs.writeFileSync(tmpFile, buffer);
          const text = await runOCR(tmpFile);
          const info = extractProductInfo(text);
          results.push({
            rawText: text,
            ...info,
          });
        } finally {
          cleanupTempFile(tmpFile);
        }
      }
      return results;
    }),
});
