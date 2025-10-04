import {
  CreateVCInput,
  createVCSchema,
  VerifiableCredential,
  VerifiableCredentialSchema,
} from '@mini-vc-wallet-1/contracts';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CredentialsService } from './credential.service.js';

@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Get()
  async list() {
    return this.credentialsService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.credentialsService.getById(id);
  }

  @Post('create')
  async create(@Body() body: CreateVCInput) {
    const parsedBody = createVCSchema.parse(body);
    return await this.credentialsService.create(parsedBody);
  }

  @Post('verify')
  async verify(@Body() body: VerifiableCredential) {
    const parsedBody = VerifiableCredentialSchema.parse(body);
    return await this.credentialsService.verify(parsedBody);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.credentialsService.deleteById(id);
  }
}
