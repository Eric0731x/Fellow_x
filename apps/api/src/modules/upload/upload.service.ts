import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  // TODO: Phase 1 — implement S3/local file storage
  async uploadAvatar(_file: Express.Multer.File) { throw new Error('Not implemented'); }
  async uploadImage(_file: Express.Multer.File) { throw new Error('Not implemented'); }
}
