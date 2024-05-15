import Converter from '@/components/Converter'
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Converter</title>
        <meta name="description" content="Converter Feed to RSS" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Converter />
    </>
  );
}
