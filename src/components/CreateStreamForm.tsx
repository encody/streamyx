import { useCreateStream } from '@livepeer/react';
import React, { useMemo, useState } from 'react';

export const CreateStreamForm: React.FC = () => {
  const [streamName, setStreamName] = useState<string>('');
  const {
    mutate: createStream,
    data: stream,
    status,
  } = useCreateStream(streamName ? { name: streamName } : null);

  const isLoading = useMemo(() => status === 'loading', [status]);

  return (
    <div>
      <input
        type="text"
        placeholder="Stream name"
        onChange={(e) => setStreamName(e.target.value)}
      />

      <div>
        {!stream && (
          <button
            onClick={() => {
              createStream?.();
            }}
            disabled={isLoading || !createStream}
          >
            Create Stream
          </button>
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
          </>
        )}
      </div>
    </div>
  );
};
