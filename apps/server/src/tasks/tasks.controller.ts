import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Body() body: Omit<Task, 'id' | 'createdAt'>) {
    // Basic validation (tRPC will have stronger validation with zod)
    if (!body.title) {
      throw new BadRequestException('title is required');
    }
    if (!body.dueDate) {
      throw new BadRequestException('dueDate is required');
    }
    const due = new Date(body.dueDate);
    if (isNaN(due.getTime())) {
      throw new BadRequestException('dueDate must be a valid date');
    }
    return await this.tasksService.create({
      title: body.title,
      description: body.description,
      dueDate: due.toISOString(),
    });
  }

  @Get()
  async list() {
    return this.tasksService.findAll();
  }
}
