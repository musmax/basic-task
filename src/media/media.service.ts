import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../media/entities/media.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}

  async saveFile(file: Express.Multer.File): Promise<Media> {
    const { originalname, filename, path, mimetype, size } = file;

    const media = new Media();
    media.filename = originalname;
    media.filepath = path;
    media.mimetype = mimetype;
    media.size = size;

    return this.mediaRepository.save(media);
  }
}
