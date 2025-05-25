import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('../components/Editor'), { ssr: false });

export default function Home() {
  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>TipTap GPT Editor</h1>
      <Editor />
    </div>
  );
}
