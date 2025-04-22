import Head from "next/head";
import styles from "@/styles/Home.module.css";
import Sketch from "@/components/Sketch";

export default function Home() {
  return (
    <>
      <Head>
        <title>P5.js Sketch</title>
        <meta
          name="description"
          content="P5.js sketch with cursor following circle"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <main className={styles.main}>
          <Sketch />
        </main>
      </div>
    </>
  );
}
