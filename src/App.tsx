import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function App() {
  const [text, setText] = useState<string>(
    localStorage.getItem("markdown") ||
      "# Willkommen 👋\n\nDies ist mein **Markdown Editor**!"
  );
  const [dark, setDark] = useState<boolean>(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    localStorage.setItem("markdown", text);
  }, [text]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
      <header className="p-4 border-b dark:border-slate-800 flex justify-between items-center">
        <h1 className="font-bold text-lg">📝 Markdown Notes</h1>
        <button
          onClick={() => setDark((d) => !d)}
          className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </header>

      <div className="grid grid-cols-2 flex-1 overflow-hidden">
        {/* ✍️ Editor */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="p-4 w-full h-full font-mono text-sm bg-slate-50 dark:bg-slate-800 outline-none resize-none"
        />
        {/* 👀 Vorschau */}
        <div className="p-4 overflow-auto prose dark:prose-invert bg-slate-100 dark:bg-slate-950">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
      </div>

      <footer className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Hergestellt mit ❤️ in React + TailwindCSS
      </footer>
    </div>
  );
}
