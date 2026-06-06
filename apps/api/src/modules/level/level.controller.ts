import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { LevelService } from './level.service';

@Controller('levels')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Get()
  @Public()
  findAll() {
    return this.levelService.findAll();
  }
}
