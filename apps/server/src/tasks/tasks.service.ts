import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  private filePath: string;
  private cache: Task[] | null = null;

  constructor() {
    const configured = process.env.TASKS_FILE;
    this.filePath = configured
      ? path.resolve(configured)
      : path.resolve(process.cwd(), 'data', 'tasks.json');
    this.ensureDir();
  }

  private ensureDir() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private readFile(): Task[] {
    if (this.cache) return this.cache;
    if (!fs.existsSync(this.filePath)) {
      this.cache = [];
      return this.cache;
    }
    try {
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const parsed: Task[] = JSON.parse(raw);
      this.cache = parsed;
      return parsed;
    } catch {
      this.cache = [];
      return this.cache;
    }
  }

  private writeFile(tasks: Task[]) {
    this.cache = tasks;
    fs.writeFileSync(this.filePath, JSON.stringify(tasks, null, 2));
  }

  async create(data: { title: string; description?: string; dueDate: string }): Promise<Task> {
    const tasks = this.readFile();
    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate).toISOString(),
      createdAt: now,
    };
    tasks.push(task);
    this.writeFile(tasks);
    return task;
  }

  async findAll(): Promise<Task[]> {
    const tasks = this.readFile();
    // newest first
    return [...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
