import { Player } from '@livepeer/react';

import Image from 'next/image';

const playbackId =
  'bafybeida3w2w7fch2fy6rfvfttqamlcyxgd3ddbf4u25n7fxzvyvcaegxy';

const PosterImage = () => {
  return (
    <Image
      alt="Livestream poster image"
      src={"/poster.jpg"}
      fill
      style={{ objectFit: 'cover' }}
      priority
    />
  );
      // placeholder="blur"
};

export const StreamPlayer = () => {
  return (
    <Player
      title="Waterfalls"
      playbackId={playbackId}
      showPipButton
      showTitle={false}
      aspectRatio="16to9"
      poster={<PosterImage />}
      controls={{
        autohide: 3000,
      }}
      theme={{
        borderStyles: { containerBorderStyle: undefined },
        radii: { containerBorderRadius: '10px' },
      }}
    />
  );
};
