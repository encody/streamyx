import { decodePayloadBase64 } from '@/types/Payload';
import { CONTRACT_ADDRESS } from '@/vars';
import {
  useContract,
  useContractRead,
  useTokenDecimals,
} from '@thirdweb-dev/react';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

export default function CreatePage() {
  const { query } = useRouter();
  const { id: webinarId, p: payloadBase64 } = query as {
    [key: string]: string | undefined;
  };

  const payload = useMemo(() => {
    if (!payloadBase64) return undefined;
    try {
      return decodePayloadBase64(payloadBase64);
    } catch (e) {
      return undefined;
    }
  }, [payloadBase64]);

  const { contract } = useContract(CONTRACT_ADDRESS);
  const { data: webinarHost } = useContractRead(contract, 'getWebinarHost', [
    webinarId,
  ]);
  const { data: webinarName } = useContractRead(
    contract,
    'getWebinarDescription',
    [webinarId],
  );
  const { data: webinarNftGate } = useContractRead(
    contract,
    'getWebinarNftGate',
    [webinarId],
  );
  const { data: webinarPayWithToken } = useContractRead(
    contract,
    'getWebinarPayWithToken',
    [webinarId],
  );
  const { data: webinarTokenCostToAttend } = useContractRead(
    contract,
    'getWebinarTokenCostToAttend',
    [webinarId],
  );

  const { contract: payWithTokenContract } = useContract(webinarPayWithToken);
  const { data: payWithTokenDecimals } = useTokenDecimals(payWithTokenContract);

  return (
    <main>
      <header>Manage webinar</header>
      {!webinarId || !payload ? (
        <p className="text-red-600 font-bold">
          There appears to be a problem with the webinar link. Please try again.
        </p>
      ) : (
        <>
          <table>
            <tbody>
              <tr>
                <td>Host</td>
                <td>{webinarHost}</td>
              </tr>
              <tr>
                <td>Name</td>
                <td>{webinarName}</td>
              </tr>
              <tr>
                <td>NFT Gate</td>
                <td>{webinarNftGate}</td>
              </tr>
              <tr>
                <td>Pay With Token</td>
                <td>{webinarPayWithToken}</td>
              </tr>
              <tr>
                <td>Token Cost To Attend</td>
                <td>{webinarTokenCostToAttend}</td>
              </tr>
            </tbody>
          </table>

          {/* A link to the stream */}
          <a
            href={`https://livepeer.com/app/stream/${webinarId}`}
            target="_blank"
            rel="noreferrer"
          >
            Open stream
          </a>

          {/* A link to the stream player */}
          <a
            href={`https://livepeer.com/app/stream/${webinarId}/player`}
            target="_blank"
            rel="noreferrer"
          >
            Open stream player
          </a>
        </>
      )}
    </main>
  );
}
