import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class UploadService {
  async uploadAvatar(_file: Express.Multer.File) {
    throw new NotImplementedException({ code: 'NOT_IMPLEMENTED', message: '文件上传功能暂未开放' });
  }

  async uploadImage(_file: Express.Multer.File) {
    throw new NotImplementedException({ code: 'NOT_IMPLEMENTED', message: '文件上传功能暂未开放' });
  }
}
