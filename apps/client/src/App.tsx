import { Toaster } from '@/components/ui/sonner';
import { RouterView } from './routes';

function App() {
  return (
    <>
      <Toaster richColors />
      <RouterView />
    </>
  );
}

export default App;
