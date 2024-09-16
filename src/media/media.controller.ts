import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { createReadStream } from 'fs';
import * as csvParser from 'csv-parser';
import { MediaService } from './media.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { Media } from './entities/media.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ClientRole } from 'src/auth/enums/role.enum';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Roles(ClientRole.Admin, ClientRole.SuperAdmin)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req: any, file: { fieldname: string; originalname: string; }, callback: (arg0: null, arg1: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);

    // Save file metadata to the database
    const savedMedia = await this.mediaService.saveFile(file);

    // Parsing CSV file
    const results = [];
    return new Promise<{ message: string; file: Express.Multer.File; data?: any; savedMedia: Media }>((resolve, reject) => {
      createReadStream(file.path)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          console.log(results);  // Here you can insert the parsed data into your database
          resolve({ message: 'File uploaded and parsed successfully', file, data: results, savedMedia });
        })
        .on('error', (error) => {
          reject(new Error('Error parsing CSV file'));
        });
    });
  }
}
