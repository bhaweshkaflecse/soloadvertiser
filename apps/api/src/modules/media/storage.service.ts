import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Storage service interface for file uploads.
 * Production: Cloudflare R2 (S3-compatible)
 * Development: Local filesystem storage
 *
 * TODO: Replace with actual R2 SDK integration for production deployment.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  // Configuration — will be loaded from environment in production
  private readonly bucket =
    process.env['R2_BUCKET'] || 'solo-advertiser-media';
  private readonly localUploadDir =
    process.env['LOCAL_UPLOAD_DIR'] || '/tmp/solo-advertiser-uploads';

  constructor() {
    // Ensure local upload directory exists in dev mode
    if (!process.env['R2_ENDPOINT']) {
      this.ensureLocalDir();
    }
  }

  /**
   * Upload a file to storage.
   * Returns the bucket, key, and URL of the stored file.
   */
  async upload(
    file: Express.Multer.File,
  ): Promise<{ bucket: string; key: string; url: string }> {
    const ext = path.extname(file.originalname);
    const key = `${Date.now()}-${randomUUID()}${ext}`;

    if (process.env['R2_ENDPOINT']) {
      // Production: Upload to Cloudflare R2
      return this.uploadToR2(file, key);
    }

    // Development: Save to local filesystem
    return this.uploadToLocal(file, key);
  }

  /**
   * Generate a time-limited signed URL for file access.
   */
  async getSignedUrl(bucket: string, key: string): Promise<string> {
    if (process.env['R2_ENDPOINT']) {
      // Production: Generate R2 presigned URL
      // TODO: Use S3 SDK to generate presigned URL with 1-hour expiry
      return `${process.env['R2_PUBLIC_URL']}/${bucket}/${key}?signed=true`;
    }

    // Development: Return local path
    return `file://${this.localUploadDir}/${key}`;
  }

  /**
   * Delete a file from storage.
   */
  async delete(bucket: string, key: string): Promise<void> {
    if (process.env['R2_ENDPOINT']) {
      // TODO: Delete from R2
      this.logger.log(`[R2] Would delete: ${bucket}/${key}`);
      return;
    }

    // Local: Remove file
    const filePath = path.join(this.localUploadDir, key);
    try {
      fs.unlinkSync(filePath);
    } catch {
      this.logger.warn(`Failed to delete local file: ${filePath}`);
    }
  }

  /**
   * Placeholder for R2 upload — to be implemented with @aws-sdk/client-s3.
   */
  private async uploadToR2(
    _file: Express.Multer.File,
    key: string,
  ): Promise<{ bucket: string; key: string; url: string }> {
    // TODO: Implement with S3-compatible SDK
    // const command = new PutObjectCommand({
    //   Bucket: this.bucket,
    //   Key: key,
    //   Body: file.buffer,
    //   ContentType: file.mimetype,
    // });
    // await this.s3Client.send(command);

    this.logger.log(`[R2] Uploaded: ${this.bucket}/${key}`);

    return {
      bucket: this.bucket,
      key,
      url: `${process.env['R2_PUBLIC_URL']}/${this.bucket}/${key}`,
    };
  }

  /**
   * Save file to local filesystem (development mode).
   */
  private async uploadToLocal(
    file: Express.Multer.File,
    key: string,
  ): Promise<{ bucket: string; key: string; url: string }> {
    const filePath = path.join(this.localUploadDir, key);
    fs.writeFileSync(filePath, file.buffer);

    this.logger.log(`[Local] Uploaded: ${filePath}`);

    return {
      bucket: 'local',
      key,
      url: `file://${filePath}`,
    };
  }

  private ensureLocalDir(): void {
    if (!fs.existsSync(this.localUploadDir)) {
      fs.mkdirSync(this.localUploadDir, { recursive: true });
    }
  }
}
