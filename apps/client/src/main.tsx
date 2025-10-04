import { trpc } from '@/lib/trpc';
import { httpBatchLink, loggerLink } from '@mini-vc-wallet-1/trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './global.css';

const queryClient = new QueryClient();
const baseUrl = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';
const trpcClient = trpc.createClient({
  links: [loggerLink(), httpBatchLink({ url: `${baseUrl}/trpc` })],
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>,
);
