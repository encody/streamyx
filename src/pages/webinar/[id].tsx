import { CONTRACT_ADDRESS } from '@/vars';
import { useContract, useContractRead } from '@thirdweb-dev/react';
import { useRouter } from 'next/router';

export default function CreatePage() {
  const { query } = useRouter();
  const { id: webinarId, sk: streamKey, su: streamIngestUrl } = query;

    const { contract } = useContract(CONTRACT_ADDRESS);
    const { } = useContractRead(contract, )

  return (
    <main>
      <header>Manage webinar</header>
      {!webinarId || !streamKey || !streamIngestUrl ? (
        <p className="text-red-600 font-bold">
          There appears to be a problem with the webinar link. Please try again.
        </p>
      ) : (
        <></>
      )}
    </main>
  );
}
