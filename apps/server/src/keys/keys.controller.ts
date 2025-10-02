import { Controller, Get } from '@nestjs/common';
import { KeysService } from './keys.service.js';

@Controller('keys')
export class KeysController {
  constructor(private readonly keysService: KeysService) {}

  @Get()
  async listPublicKeys() {
    return this.keysService.getAllPublicKeys();
  }

  @Get()
  async listIds() {
    return this.keysService.getAllIds();
  }
}
