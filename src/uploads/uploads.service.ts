import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { Client } from 'minio';
import {
  minioAccessKey,
  minioBucket,
  minioEndpoint,
  minioPort,
  minioRegion,
  minioSecretKey,
  minioUrlExpirySeconds,
  minioUseSSL,
} from 'src/constants';

@Injectable()
export class UploadsService implements OnModuleInit {
  private readonly bucket = minioBucket;

  private readonly client = new Client({
    endPoint: minioEndpoint,
    port: minioPort,
    useSSL: minioUseSSL,
    accessKey: minioAccessKey,
    secretKey: minioSecretKey,
    region: minioRegion,
  });

  async onModuleInit() {
    try {
      const bucketExists = await this.client.bucketExists(this.bucket);
      if (!bucketExists) {
        await this.client.makeBucket(this.bucket, minioRegion);
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Falha ao inicializar bucket MinIO: ${(error as Error).message}`,
      );
    }
  }

  async uploadImage(file: {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
  }) {
    const extension = extname(file.originalname).toLowerCase();
    const objectName = `${new Date().toISOString().slice(0, 10)}-${randomUUID()}${extension}`;

    await this.client.putObject(
      this.bucket,
      objectName,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    const url = await this.getSignedUrl(objectName);

    return {
      bucket: this.bucket,
      objectName,
      contentType: file.mimetype,
      size: file.size,
      url,
    };
  }

  async getImageUrl(objectName: string, expiresInSeconds?: number) {
    if (!objectName?.trim()) {
      throw new BadRequestException('objectName e obrigatorio');
    }

    const url = await this.getSignedUrl(objectName, expiresInSeconds);

    return {
      bucket: this.bucket,
      objectName,
      url,
    };
  }

  async removeImage(objectName: string) {
    if (!objectName?.trim()) {
      throw new BadRequestException('objectName e obrigatorio');
    }

    await this.client.removeObject(this.bucket, objectName);

    return {
      bucket: this.bucket,
      objectName,
      deleted: true,
    };
  }

  private async getSignedUrl(objectName: string, expiresInSeconds?: number) {
    const expires = expiresInSeconds ?? minioUrlExpirySeconds;

    return this.client.presignedGetObject(this.bucket, objectName, expires);
  }
}
