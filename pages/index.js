import Head from 'next/head';
import Editor from '@/components/Editor';
import styles from '@/styles/Home.module.css';

export default function Home() {
  return (
    <>
      <Head>
        <title>Smart Text Editor</title>
        <meta name="description" content="A smart text editor with AI-powered suggestions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Smart Text Editor</h1>
          <p className={styles.description}>
            Start typing to get spelling, grammar, style, and phrasing suggestions. Click on highlighted text to see options.
          </p>
          <Editor />
        </div>
      </main>
    </>
  );
}
