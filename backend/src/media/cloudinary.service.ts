import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';
import type { Env } from '../config/env';
import { CLOUDINARY_FOLDER, type MediaKind } from './media.constants';

/** Everything the browser needs to upload one file straight to Cloudinary. */
export interface UploadTicket {
  uploadUrl: string;
  fields: Record<string, string>;
}

export interface CloudinaryAsset {
  url: string;
  bytes: number;
}

/** Cloudinary rejects API calls with `{ error: { http_code } }` objects, not Error instances. */
const httpCodeOf = (error: unknown): number | undefined =>
  (error as { error?: { http_code?: number } } | undefined)?.error?.http_code;

@Injectable()
export class CloudinaryService {
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(config: ConfigService<Env, true>) {
    this.cloudName = config.get('CLOUDINARY_CLOUD_NAME', { infer: true });
    this.apiKey = config.get('CLOUDINARY_API_KEY', { infer: true });
    this.apiSecret = config.get('CLOUDINARY_API_SECRET', { infer: true });
    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
      secure: true,
    });
  }

  /**
   * Signs a one-off upload. The file goes from the browser to Cloudinary directly, so the API
   * never buffers it and no proxy body-size limit applies.
   */
  createUploadTicket(kind: MediaKind, extension = ''): UploadTicket {
    this.assertConfigured();
    const params = {
      folder: CLOUDINARY_FOLDER,
      public_id: `${randomUUID()}${extension}`,
      timestamp: String(Math.round(Date.now() / 1000)),
    };
    const signature = cloudinary.utils.api_sign_request(params, this.apiSecret);
    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${this.cloudName}/${kind}/upload`,
      fields: { ...params, api_key: this.apiKey, signature },
    };
  }

  /** Looks the asset up server-side, so only files that really exist in the account get stored. */
  async getAsset(publicId: string, kind: MediaKind): Promise<CloudinaryAsset> {
    this.assertConfigured();
    try {
      const asset = (await cloudinary.api.resource(publicId, { resource_type: kind })) as {
        secure_url: string;
        bytes: number;
      };
      return { url: asset.secure_url, bytes: asset.bytes };
    } catch (error) {
      if (httpCodeOf(error) === 404)
        throw new BadRequestException('The upload was not found on Cloudinary');
      throw new BadGatewayException('Could not reach Cloudinary');
    }
  }

  /** Deletes the asset; an asset that is already gone counts as deleted. */
  async destroy(publicId: string, kind: MediaKind): Promise<void> {
    this.assertConfigured();
    let result: string | undefined;
    try {
      ({ result } = (await cloudinary.uploader.destroy(publicId, {
        resource_type: kind,
        invalidate: true,
      })) as { result?: string });
    } catch {
      throw new BadGatewayException('Could not reach Cloudinary');
    }
    if (result !== 'ok' && result !== 'not found') {
      throw new BadGatewayException(
        `Cloudinary did not delete the file (${result ?? 'no result'})`,
      );
    }
  }

  private assertConfigured(): void {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new ServiceUnavailableException('Cloudinary is not configured on the server');
    }
  }
}
