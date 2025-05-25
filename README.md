# TipTap GPT Editor

This project provides a simple Grammarly-like text editor built with **Next.js** and **TipTap**. It integrates the **OpenAI GPT-4o-mini** model to detect spelling, grammar, and stylistic issues in real time.

## Features

- Highlights grammar and spelling mistakes in red and style issues in yellow while typing.
- Hover or click on highlighted text to see an explanation and suggested correction.
- Option to accept or ignore suggestions.
- Occasional hints for improved phrasing.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Export your OpenAI API key:

```bash
export OPENAI_API_KEY=your-key
```

3. Start the development server:

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Notes

- The `/api/check` endpoint uses GPT-4o-mini to generate error data. The response is expected to be an array of objects with `start`, `end`, `type`, `explanation`, and `suggestion` fields representing offsets in the input text.
- The frontend applies these ranges as highlights and shows suggestions in tooltips.

