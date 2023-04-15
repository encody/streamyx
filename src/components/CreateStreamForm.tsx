import { createPayloadBase64Url } from '@/types/Payload';
import { CONTRACT_ADDRESS } from '@/vars';
import { Input, Link } from '@chakra-ui/react';
import { useCreateStream } from '@livepeer/react';
import {
  Web3Button,
  useContract,
  useContractRead,
  useContractWrite,
  useTokenDecimals,
} from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import React, { useMemo, useState } from 'react';

export const CreateStreamForm: React.FC = () => {
  const [streamName, setStreamName] = useState<string>('');
  const [nftGateAddress, setNftGateAddress] = useState<string>('');
  const [payWithToken, setPayWithToken] = useState<string>('');
  const [tokenCostToAttend, setTokenCostToAttend] = useState<number>(0);

  const {
    mutate: createStream,
    data: stream,
    status,
  } = useCreateStream(streamName ? { name: streamName } : null);

  const isStreamLoading = useMemo(() => status === 'loading', [status]);

  const { contract } = useContract(CONTRACT_ADDRESS);

  const {
    mutateAsync: contractCreateWebinar,
    isLoading: isContractLoading,
    error: contractError,

  } = useContractWrite(contract, 'createWebinarFixedRate');

  const payWithTokenIsValidAddress = useMemo(
    () => ethers.utils.isAddress(payWithToken),
    [payWithToken],
  );

  const { contract: payWithTokenContract } = useContract(
    payWithTokenIsValidAddress ? payWithToken : undefined,
  );

  const { data: payWithTokenDecimals } = useTokenDecimals(payWithTokenContract);
  // const payWithTokenDecimals = undefined;

  // const streamUrl = useMemo(() => { });

  return (
    <div className="flex flex-col p-3 gap-3 w-96">
      <Input
        type="text"
        placeholder="Stream name"
        value={streamName}
        onChange={(e) => setStreamName(e.target.value)}
      />
      <Input
        type="text"
        placeholder="NFT Gate Address (optional)"
        value={nftGateAddress}
        onChange={(e) => setNftGateAddress(e.target.value)}
      />
      <Input
        type="text"
        placeholder="Viewers pay with token address (optional)"
        value={payWithToken}
        isInvalid={payWithToken.length > 0 && payWithTokenIsValidAddress}
        onChange={(e) => setPayWithToken(e.target.value)}
      />
      {payWithToken && (
        <Input
          type="number"
          placeholder="How much of this token?"
          value={tokenCostToAttend + ''}
          onChange={(e) => setTokenCostToAttend(parseInt(e.target.value))}
        />
      )}
      <div>
        {!!contractError && (
          <>
            <p className="font-bold text-red-600">
              There was an error connecting to the smart contract.
            </p>
            <pre>{JSON.stringify(contractError, null, 2)}</pre>
          </>
        )}
        {!stream && (
          <Web3Button
            contractAddress={CONTRACT_ADDRESS}
            action={async () => {
              const decimals = payWithTokenDecimals ?? 18;
              const cost = BigInt(tokenCostToAttend * 10 ** decimals);
              const res = await contractCreateWebinar({
                args: [
                  streamName,
                  nftGateAddress || ethers.constants.AddressZero,
                  payWithToken || ethers.constants.AddressZero,
                  cost,
                ],
              });
              console.log('got back from contract', res);
              createStream?.();
            }}
            isDisabled={isStreamLoading || !createStream || isContractLoading}
          >
            Create Stream
          </Web3Button>
        )}
        {stream && (
          <>
            <p>
              <strong>Congratulations!</strong>
            </p>
            <p>Your stream has been created.</p>
            <p>
              Here are the details. Save these for when you want to start
              streaming!
            </p>
            <p>
              <strong>Stream URL:</strong> <code>{stream.rtmpIngestUrl}</code>
            </p>
            <p>
              <strong>Stream Key:</strong> <code>{stream.streamKey}</code>
            </p>
            <p>
              Save this link (it contains all the information you&apos;ll need):{' '}
              {/* <Link
                href={{
                  pathname: '/webinar/[id]',
                  query: {
                    id: 0,
                    p: createPayloadBase64('streamkey', 'ingesturl'),
                  },
                }}
              >
                Copy this link!
              </Link> */}
            </p>
          </>
        )}
      </div>
    </div>
  );
};
