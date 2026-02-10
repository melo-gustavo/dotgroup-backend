import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';

describe('UploadsService', () => {
  let service: UploadsService;
  let minioClientMock: {
    bucketExists: jest.Mock;
    makeBucket: jest.Mock;
    putObject: jest.Mock;
    presignedGetObject: jest.Mock;
    removeObject: jest.Mock;
  };

  beforeEach(() => {
    service = new UploadsService();

    minioClientMock = {
      bucketExists: jest.fn(),
      makeBucket: jest.fn(),
      putObject: jest.fn(),
      presignedGetObject: jest.fn(),
      removeObject: jest.fn(),
    };

    const serviceTest = service as unknown as {
      client: typeof minioClientMock;
      bucket: string;
    };
    serviceTest.client = minioClientMock;
    serviceTest.bucket = 'dotgroup-images';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should not create bucket when it already exists', async () => {
      minioClientMock.bucketExists.mockResolvedValue(true);

      await expect(service.onModuleInit()).resolves.toBeUndefined();
      expect(minioClientMock.bucketExists).toHaveBeenCalledWith(
        'dotgroup-images',
      );
      expect(minioClientMock.makeBucket).not.toHaveBeenCalled();
    });

    it('should create bucket when it does not exist', async () => {
      minioClientMock.bucketExists.mockResolvedValue(false);
      minioClientMock.makeBucket.mockResolvedValue(undefined);

      await expect(service.onModuleInit()).resolves.toBeUndefined();
      expect(minioClientMock.makeBucket).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when minio fails', async () => {
      minioClientMock.bucketExists.mockRejectedValue(new Error('minio error'));

      await expect(service.onModuleInit()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('uploadImage', () => {
    it('should upload image and return metadata with signed url', async () => {
      minioClientMock.putObject.mockResolvedValue(undefined);
      minioClientMock.presignedGetObject.mockResolvedValue('http://signed-url');

      const file = {
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('image'),
        size: 5,
      };

      const result = await service.uploadImage(file);

      expect(minioClientMock.putObject).toHaveBeenCalledTimes(1);
      expect(minioClientMock.presignedGetObject).toHaveBeenCalledTimes(1);
      expect(result.bucket).toBe('dotgroup-images');
      expect(result.objectName).toContain('.jpg');
      expect(result.url).toBe('http://signed-url');
    });
  });

  describe('getImageUrl', () => {
    it('should return signed url for valid objectName', async () => {
      minioClientMock.presignedGetObject.mockResolvedValue('http://signed-url');

      const result = await service.getImageUrl('object-name.jpg', 60);

      expect(minioClientMock.presignedGetObject).toHaveBeenCalledWith(
        'dotgroup-images',
        'object-name.jpg',
        60,
      );
      expect(result.url).toBe('http://signed-url');
    });

    it('should throw when objectName is empty', async () => {
      await expect(service.getImageUrl('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('removeImage', () => {
    it('should remove image and return deleted metadata', async () => {
      minioClientMock.removeObject.mockResolvedValue(undefined);

      const result = await service.removeImage('object-name.jpg');

      expect(minioClientMock.removeObject).toHaveBeenCalledWith(
        'dotgroup-images',
        'object-name.jpg',
      );
      expect(result.deleted).toBe(true);
    });

    it('should throw when objectName is empty', async () => {
      await expect(service.removeImage('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
