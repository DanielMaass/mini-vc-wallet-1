export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string
  createdAt: string; // ISO string
}
