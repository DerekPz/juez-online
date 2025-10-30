import { Body, Controller, Get, Param, Post, NotFoundException } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { randomUUID } from 'crypto';

@Controller('challenges')
export class ChallengesController {
  constructor(private readonly svc: ChallengesService) {}

  @Post()
  async create(@Body() dto: CreateChallengeDto) {
    const id = randomUUID();
    const c = await this.svc.create({ id, title: dto.title, description: dto.description });
    return { id: c.id, title: c.title, status: c.status, createdAt: c.createdAt };
  }

  @Get()
  async list() {
    const items = await this.svc.list();
    return items.map(c => ({ id: c.id, title: c.title, status: c.status, createdAt: c.createdAt }));
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const c = await this.svc.get(id);
    if (!c) throw new NotFoundException('Challenge not found');
    return { id: c.id, title: c.title, description: c.description, status: c.status, createdAt: c.createdAt };
  }

  @Post(':id/publish')                 
  async publish(@Param('id') id: string) {
    try {
      const c = await this.svc.publish(id);
      return { id: c.id, status: c.status, updatedAt: c.updatedAt };
    } catch {
      throw new NotFoundException('Challenge not found');
    }
  }

  @Post(':id/archive')                 
  async archive(@Param('id') id: string) {
    try {
      const c = await this.svc.archive(id);
      return { id: c.id, status: c.status, updatedAt: c.updatedAt };
    } catch {
      throw new NotFoundException('Challenge not found');
    }
  }
}
