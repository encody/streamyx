import { Player } from '@livepeer/react';

import Image from 'next/image';

import posterImage from '../../public/poster.jpg';

const playbackId = '6bfa5yi0nw1bilo9';

const PosterImage = () => {
  return (
    <Image
      alt="Livestream poster image"
      src={posterImage}
      fill
      style={{ objectFit: 'cover' }}
      priority
      placeholder="blur"
    />
  );
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
