import { trpc } from '@/lib/trpc';
import type { VerifiableCredential } from '@mini-vc-wallet-1/contracts';
import { Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';

export function CredentialsPage() {
  const navigateTo = useNavigate();
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.listCredentials.useQuery();
  const deleteCredentialMutation = trpc.deleteCredentialById.useMutation({
    onSuccess: () => {
      utils.listCredentials.invalidate();
      toast.success('Credential deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error((error as Error).message);
    },
  });

  function copyCredential(credential: VerifiableCredential) {
    navigator.clipboard.writeText(JSON.stringify(credential, null, 2));
    toast.success('Credential copied to clipboard');
  }

  async function deleteCredential(id: string) {
    if (confirm('Are you sure you want to delete this credential?')) {
      deleteCredentialMutation.mutate(id);
    }
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading credentials</div>;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">My Credentials</h1>
        <Button className="ms-auto" onClick={() => navigateTo('/verify')}>
          Verify
        </Button>
        <Button onClick={() => navigateTo('/create')}>Create new</Button>
      </div>
      <div>
        {!data?.length && 'No credentials found'}
        {data?.map((cred: VerifiableCredential) => (
          <div
            key={cred.id}
            className="flex items-center gap-2 p-2 border border-gray-300 rounded mb-2"
          >
            <p className="grow truncate">Type: {cred.type.join(', ')}</p>
            <p className="grow truncate">IssuerID: {cred.issuer}</p>
            <p className="grow truncate">
              credentialSubject:{' '}
              {Object.entries(cred.credentialSubject)
                .map(([key, value]) => {
                  return `${key}: ${value}`;
                })
                .join(', ')}
            </p>
            <Button onClick={() => navigateTo(`/${cred.id}`)}>Details</Button>
            <Button onClick={() => copyCredential(cred)}>Copy</Button>
            <Button size="icon" variant="destructive" onClick={() => deleteCredential(cred.id)}>
              <Trash />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
