import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  health() {
    return { status: 'ok', time: new Date().toISOString() };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
