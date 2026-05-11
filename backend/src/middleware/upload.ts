import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { StorageEngine } from 'multer';
import { Request } from 'express';
import { Readable } from 'stream';
import '../config/cloudinary';

class CloudinaryStorage implements StorageEngine {
  _handleFile(
    _req: Request,
    file: Express.Multer.File,
    cb: (error?: Error | null, info?: Partial<Express.Multer.File>) => void
  ) {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'iwords/cards',
        transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error || !result) return cb(error ?? new Error('Upload failed'));
        cb(null, {
          path: result.secure_url,
          filename: result.public_id,
          size: result.bytes,
        });
      }
    );

    const readable = new Readable();
    readable._read = () => {};

    file.stream.on('data', (chunk: Buffer) => {
      readable.push(chunk);
      uploadStream.write(chunk);
    });
    file.stream.on('end', () => uploadStream.end());
    file.stream.on('error', (err: Error) => cb(err));
  }

  _removeFile(
    _req: Request,
    file: Express.Multer.File & { filename?: string },
    cb: (error: Error | null) => void
  ) {
    if (!file.filename) return cb(null);
    cloudinary.uploader.destroy(file.filename, (err) => cb(err ?? null));
  }
}

export const upload = multer({
  storage: new CloudinaryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});
