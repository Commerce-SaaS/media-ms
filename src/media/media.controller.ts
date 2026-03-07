import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';

import { MEDIA_PATTERNS } from './patterns/media_patterns';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @MessagePattern(MEDIA_PATTERNS.CREATE)
  create(@Payload() data: any) {
    return this.mediaService.upload(data);
  }

  @MessagePattern(MEDIA_PATTERNS.DELETE)
  remove(@Payload() id: string) {
    return this.mediaService.remove(id);
  }
}
