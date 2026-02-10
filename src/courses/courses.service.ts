import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course, CourseType } from './entities/course.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { parseDateField } from '../common/common';
import { CourseFilterDto } from './dto/filter-course.dto';
import { UploadsService } from '../uploads/uploads.service';

const validationCourse: (course: CreateCourseDto | UpdateCourseDto) => {
  createdAt: any;
  updatedAt: any;
} = (course: CreateCourseDto | UpdateCourseDto) => {
  if (!course.title?.trim()) {
    throw new BadRequestException('O campo "title" e obrigatorio');
  }

  if (!course.description?.trim()) {
    throw new BadRequestException('O campo "description" e obrigatorio');
  }

  if (!course.type) {
    throw new BadRequestException('O campo "type" e obrigatorio');
  }

  if (!Object.values(CourseType).includes(course.type)) {
    throw new BadRequestException('O campo "type" e invalido');
  }

  const createdAt =
    course.createdAt !== undefined && course.createdAt !== null
      ? parseDateField(course.createdAt, 'createdAt')
      : undefined;
  const updatedAt =
    course.updatedAt !== undefined && course.updatedAt !== null
      ? parseDateField(course.updatedAt, 'updatedAt')
      : undefined;

  return { createdAt, updatedAt };
};

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private uploadsService: UploadsService,
  ) {}

  async create(createCourseDto: CreateCourseDto, imageFile?: any) {
    const { createdAt, updatedAt } = validationCourse(createCourseDto);

    let imageUrl: string | undefined;

    if (imageFile) {
      const uploadResult = await this.uploadsService.uploadImage(imageFile);
      imageUrl = uploadResult.objectName;
    }

    const course = this.courseRepository.create({
      ...createCourseDto,
      ...(imageUrl ? { image_url: imageUrl } : {}),
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    });

    const savedCourse = await this.courseRepository.save(course);
    return this.attachSignedImageUrl(savedCourse);
  }

  async findAll(query: CourseFilterDto) {
    const where: FindOptionsWhere<Course> = {};

    if (query.title) where.title = ILike(`%${query.title}%`);
    if (query.type) where.type = query.type;

    const courses = await this.courseRepository.find({ where });
    return Promise.all(
      courses.map((course) => this.attachSignedImageUrl(course)),
    );
  }

  async findOne(id: number) {
    const course = await this.findOneRaw(id);
    return this.attachSignedImageUrl(course);
  }

  async update(id: number, updateCourseDto: UpdateCourseDto, imageFile?: any) {
    const { createdAt, updatedAt } = validationCourse(updateCourseDto);
    const { removeImage, ...coursePayload } = updateCourseDto;

    const course = await this.findOneRaw(id);
    const previousImageRef = course.image_url;
    const shouldRemoveImage = Boolean(removeImage);

    let imageUrl: string | undefined;

    if (imageFile) {
      const uploadResult = await this.uploadsService.uploadImage(imageFile);
      imageUrl = uploadResult.objectName;
    }

    const updatedCourse = this.courseRepository.merge(course, {
      ...coursePayload,
      ...(imageUrl ? { image_url: imageUrl } : {}),
      ...(!imageUrl && shouldRemoveImage ? { image_url: null } : {}),
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    });

    const savedCourse = await this.courseRepository.save(updatedCourse);

    if ((imageUrl || shouldRemoveImage) && previousImageRef) {
      const previousObjectName = this.extractObjectName(previousImageRef);
      if (previousObjectName && previousObjectName !== imageUrl) {
        void this.uploadsService
          .removeImage(previousObjectName)
          .catch(() => undefined);
      }
    }

    return this.attachSignedImageUrl(savedCourse);
  }

  async remove(id: number) {
    const course = await this.findOneRaw(id);

    await this.courseRepository.delete(id);

    if (course.image_url) {
      const objectName = this.extractObjectName(course.image_url);
      if (objectName) {
        try {
          await this.uploadsService.removeImage(objectName);
        } catch {
          // Best effort cleanup: curso ja foi removido
        }
      }
    }

    return { deleted: true };
  }

  private async findOneRaw(id: number) {
    const course = await this.courseRepository.findOneBy({ id });

    if (!course) {
      throw new NotFoundException(`Curso com ID ${id} nao encontrado`);
    }

    return course;
  }

  private async attachSignedImageUrl(course: Course) {
    if (!course.image_url) {
      return course;
    }

    const objectName = this.extractObjectName(course.image_url);

    try {
      const imageData = await this.uploadsService.getImageUrl(objectName);
      return {
        ...course,
        image_url: imageData.url,
      };
    } catch {
      return course;
    }
  }

  private extractObjectName(imageRef: string) {
    const value = imageRef.trim();
    if (!value) {
      return value;
    }

    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      return value;
    }

    try {
      const parsed = new URL(value);
      const segments = parsed.pathname.split('/').filter(Boolean);

      if (segments.length >= 2) {
        return segments.slice(1).join('/');
      }

      return value;
    } catch {
      return value;
    }
  }
}
