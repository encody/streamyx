import { FormLabel, Input } from '@chakra-ui/react';
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

      {stream?.playbackId && (
        <Player
          title={stream?.name}
          playbackId={stream?.playbackId}
          autoPlay
          muted
        />
      )}

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
      </div>
    </div>
  );
};
