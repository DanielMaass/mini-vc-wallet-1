import { Module } from '@nestjs/common';
import { KeysService } from './keys.service.js';

@Module({
  controllers: [],
  providers: [KeysService],
  exports: [KeysService],
})
export class KeysModule {}
