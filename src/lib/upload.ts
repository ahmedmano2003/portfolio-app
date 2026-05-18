import path from 'path';
import { promises as fs } from 'fs';
import crypto from 'crypto';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = (Number(process.env.UPLOAD_MAX_SIZE_MB) || 5) * 1024 * 1024;
const ALLOWED = (
  process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,image/gif'
).split(',');

// MIME magic bytes - الكشف الحقيقي للنوع (مش الاعتماد على extension)
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ],
};

function detectRealMime(buf: Buffer): string | null {
  for (const [mime, sigs] of Object.entries(MAGIC_BYTES)) {
    for (const sig of sigs) {
      if (sig.every((byte, i) => buf[i] === byte)) return mime;
    }
  }
  return null;
}

export async function saveUploadedImage(
  file: File
): Promise<{ url: string; size: number; mime: string }> {
  // ✅ Validation الحجم
  if (file.size > MAX_SIZE) {
    throw new Error(`الملف أكبر من ${MAX_SIZE / 1024 / 1024}MB`);
  }
  if (file.size === 0) throw new Error('الملف فاضي');

  // ✅ Validation اسم الملف - يمنع path traversal
  const safeName = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, '');
  if (!safeName) throw new Error('اسم الملف غير صالح');

  const buffer = Buffer.from(await file.arrayBuffer());

  // ✅ التحقق من النوع الحقيقي (magic bytes) - مش بس الـ MIME المرسل
  const realMime = detectRealMime(buffer);
  if (!realMime || !ALLOWED.includes(realMime)) {
    throw new Error('نوع الملف غير مسموح');
  }

  // ✅ معالجة بـ sharp - يحول لـ webp ويزيل أي metadata/scripts خبيثة
  let processed: Buffer;
  let extension: string;

  try {
    processed = await sharp(buffer)
      .rotate() // respect EXIF orientation
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
    extension = 'webp';
  } catch {
    throw new Error('الصورة تالفة أو غير صالحة');
  }

  // ✅ اسم عشوائي - يمنع overwriting وguessing
  const random = crypto.randomBytes(16).toString('hex');
  const filename = `${Date.now()}-${random}.${extension}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filepath = path.join(UPLOAD_DIR, filename);

  // ✅ تأكيد إن المسار النهائي جوه UPLOAD_DIR (حماية إضافية من traversal)
  if (!filepath.startsWith(UPLOAD_DIR)) {
    throw new Error('Invalid path');
  }

  await fs.writeFile(filepath, processed);

  return {
    url: `/uploads/${filename}`,
    size: processed.length,
    mime: 'image/webp',
  };
}
