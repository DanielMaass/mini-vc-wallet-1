import { Module } from '@nestjs/common';
import { KeysModule } from '../keys/keys.module.js';
import { CredentialsService } from './credential.service.js';

@Module({
  imports: [KeysModule],
  providers: [CredentialsService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
