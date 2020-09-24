import type { AppProps } from 'next/app'

import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { stylisPluginLogicalProperties } from '../src/stylis-plugin-logical-properties'

export const emotionCache = createCache({
  key: 'isbl',
  stylisPlugins: [stylisPluginLogicalProperties],
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CacheProvider value={emotionCache}>
      <Component {...pageProps} />
    </CacheProvider>
  )
}
