import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { trpc } from '../lib/trpc';

export function CredentialVerifyPage() {
  const navigateTo = useNavigate();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const verifyCredential = trpc.verifyCredential.useMutation();
  const handleSubmit = async (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    setIsValid(null);
    const form = formEvent.currentTarget;
    const textarea = form.querySelector('textarea');
    if (textarea) {
      const credentialJson = textarea.value;
      try {
        const credential = JSON.parse(credentialJson);
        const response = await verifyCredential.mutateAsync(credential);
        setIsValid(response.isValid);
      } catch (error: unknown) {
        console.error('Invalid JSON:', error);
      }
    }
  };

  return (
    <div className="text-start space-y-4">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigateTo(-1)} size={'icon'} variant={'outline'}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold">Verifiable Credential</h1>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          className="border border-gray-300 rounded p-2 h-64"
          placeholder="Paste credential JSON here"
          onChange={() => setIsValid(null)}
        ></textarea>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Verify
        </button>
      </form>
      {isValid !== null && (
        <div className={`mt-4 p-4 rounded ${isValid ? 'bg-green-100' : 'bg-red-100'}`}>
          {isValid ? 'Credential is valid.' : 'Credential is invalid.'}
        </div>
      )}
    </div>
  );
}
