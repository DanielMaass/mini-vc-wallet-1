import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CredentialsModule } from './credentials/credential.module.js';
import { KeysModule } from './keys/keys.module.js';

@Module({
  imports: [CredentialsModule, KeysModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
