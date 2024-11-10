import Head from "next/head";
import PortfolioBG from "./PortfolioBG";

export default function Home() {
  return (
    <>
      <Head>
        <title>Scroll Controlled Canvas Animation</title>
        <meta name="description" content="Portfoilio BG" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PortfolioBG />
    </>
  );
}
