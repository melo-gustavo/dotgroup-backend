import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

describe('UploadsController', () => {
  let controller: UploadsController;
  let uploadsService: {
    uploadImage: jest.Mock;
    getImageUrl: jest.Mock;
  };

  beforeEach(async () => {
    const uploadsServiceMock = {
      uploadImage: jest.fn(),
      getImageUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [
        {
          provide: UploadsService,
          useValue: uploadsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);
    uploadsService = module.get(UploadsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should upload file using service', async () => {
      const file = {
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('img'),
        size: 3,
      };
      const response = { objectName: 'object.jpg', url: 'http://signed-url' };
      uploadsService.uploadImage.mockResolvedValue(response);

      await expect(controller.uploadImage(file)).resolves.toEqual(response);
      expect(uploadsService.uploadImage).toHaveBeenCalledWith(file);
    });

    it('should throw when file is not sent', async () => {
      await expect(controller.uploadImage(undefined)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getImageUrl', () => {
    it('should parse expiresInSeconds and call service', async () => {
      const response = { objectName: 'object.jpg', url: 'http://signed-url' };
      uploadsService.getImageUrl.mockResolvedValue(response);

      await expect(
        controller.getImageUrl(
          { objectName: 'object.jpg' },
          { expiresInSeconds: 120 },
        ),
      ).resolves.toEqual(response);
      expect(uploadsService.getImageUrl).toHaveBeenCalledWith(
        'object.jpg',
        120,
      );
    });

    it('should call service with undefined expiration when query is missing', async () => {
      const response = { objectName: 'object.jpg', url: 'http://signed-url' };
      uploadsService.getImageUrl.mockResolvedValue(response);

      await expect(
        controller.getImageUrl({ objectName: 'object.jpg' }, {}),
      ).resolves.toEqual(response);
      expect(uploadsService.getImageUrl).toHaveBeenCalledWith(
        'object.jpg',
        undefined,
      );
    });

    it('should throw when expiresInSeconds is invalid', async () => {
      await expect(
        controller.getImageUrl(
          { objectName: 'object.jpg' },
          { expiresInSeconds: Number.NaN },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when expiresInSeconds is less than or equal to zero', async () => {
      await expect(
        controller.getImageUrl(
          { objectName: 'object.jpg' },
          { expiresInSeconds: 0 },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
