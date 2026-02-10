import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseFilterDto } from './dto/filter-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo curso com upload de imagem opcional' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Título do Curso' },
        description: { type: 'string', example: 'Descrição do curso' },
        type: { type: 'string', example: 'TECHNOLOGY' },
        image: { type: 'string', format: 'binary' },
      },
      required: ['title', 'description', 'type'],
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFile() image?: any,
  ) {
    return await this.coursesService.create(createCourseDto, image);
  }

  @Get()
  async findAll(@Query() query: CourseFilterDto) {
    return await this.coursesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.coursesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um curso com upload de imagem opcional' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Titulo do Curso' },
        description: { type: 'string', example: 'Descricao do curso' },
        type: { type: 'string', example: 'TECHNOLOGY' },
        updatedAt: { type: 'string', format: 'date-time' },
        removeImage: { type: 'boolean', example: true },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @UploadedFile() image?: any,
  ) {
    return await this.coursesService.update(id, updateCourseDto, image);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.coursesService.remove(id);
  }
}
