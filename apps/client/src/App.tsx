import { Button } from './components/ui/button';
import { trpc } from './lib/trpc';

function App() {
  const utils = trpc.useUtils();
  const { data: tasks, isLoading, error } = trpc.listTasks.useQuery();
  const createTask = trpc.createTask.useMutation({
    onSuccess: () => {
      utils.listTasks.invalidate();
    },
  });

  const addSample = () => {
    createTask.mutate({
      title: 'Sample Task',
      dueDate: new Date(Date.now() + 3600_000).toISOString(),
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Client + tRPC + shadcn/ui</h1>
      <div className="space-x-2">
        <Button variant="default" onClick={addSample} disabled={createTask.isPending}>
          {createTask.isPending ? 'Creating...' : 'Add Sample Task'}
        </Button>
      </div>
      <div>
        <h2 className="text-xl font-semibold">Tasks</h2>
        {isLoading && <p className="text-sm">Loading...</p>}
        {error && (
          <p className="text-sm text-red-600">
            Failed to load tasks: {(error as any).message || 'Unknown error'}
          </p>
        )}
        {!isLoading && !error && tasks?.length === 0 && (
          <p className="text-sm text-muted-foreground">No tasks yet. Create one above.</p>
        )}
        <ul className="list-disc pl-5 space-y-1">
          {tasks?.map((t) => (
            <li key={t.id}>
              <span className="font-medium">{t.title}</span>{' '}
              <span className="text-xs text-muted-foreground">
                (due {new Date(t.dueDate).toLocaleString()})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
