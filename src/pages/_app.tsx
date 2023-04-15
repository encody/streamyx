import '@/styles/globals.css';
import type { AppProps } from 'next/app';

import {
  LivepeerConfig,
  ThemeConfig,
  createReactClient,
  studioProvider,
} from '@livepeer/react';
import * as React from 'react';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { STUDIO_API_KEY } from '@/vars';

const livepeerClient = createReactClient({
  provider: studioProvider({
    apiKey: STUDIO_API_KEY,
  }),
});

const theme: ThemeConfig = {
  colors: {
    accent: 'rgb(0, 145, 255)',
    containerBorderColor: 'rgba(0, 145, 255, 0.9)',
  },
  fonts: {
    display: 'Inter',
  },
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider activeChain="mumbai">
      <LivepeerConfig client={livepeerClient} theme={theme}>
        <Component {...pageProps} />
      </LivepeerConfig>
    </ThirdwebProvider>
  );
}
