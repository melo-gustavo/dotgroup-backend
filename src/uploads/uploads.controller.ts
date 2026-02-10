import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { uploadMaxFileSizeBytes } from 'src/constants';
import { UploadImageDto } from './dto/upload-image.dto';
import { GetImageUrlParamsDto } from './dto/get-image-url-params.dto';
import { GetImageUrlQueryDto } from './dto/get-image-url-query.dto';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImageDto })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: uploadMaxFileSizeBytes,
      },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(
            new BadRequestException('Apenas arquivos de imagem sao permitidos'),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Arquivo nao enviado');
    }

    return this.uploadsService.uploadImage(file);
  }

  @Get('image/:objectName/url')
  async getImageUrl(
    @Param() params: GetImageUrlParamsDto,
    @Query() query: GetImageUrlQueryDto,
  ) {
    const expiresInSeconds = query.expiresInSeconds;
    if (
      expiresInSeconds !== undefined &&
      (!Number.isInteger(expiresInSeconds) || expiresInSeconds <= 0)
    ) {
      throw new BadRequestException('expiresInSeconds deve ser maior que zero');
    }

    return this.uploadsService.getImageUrl(params.objectName, expiresInSeconds);
  }
}
