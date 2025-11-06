import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function MarkdownEditor() {
  const [text, setText] = useState<string>(
    localStorage.getItem("markdown") ||
      "# Willkommen 👋\n\nDies ist mein **Markdown Editor**!"
  );
  const [dark, setDark] = useState<boolean>(
    localStorage.getItem("theme") === "dark"
  );

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Autosave
  useEffect(() => localStorage.setItem("markdown", text), [text]);

  // Theme toggling
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Undo / Redo Stack
  const history = useRef<string[]>([text]);
  const pointer = useRef<number>(0);
    const isUserInput = useRef<boolean>(true);

  const pushHistory = (value: string) => {
    const stack = history.current.slice(0, pointer.current + 1);
    stack.push(value);
    history.current = stack;
    pointer.current = stack.length - 1;
  };
  const undo = () => {
    if (pointer.current > 0) {
      pointer.current -= 1;
          isUserInput.current = false;
      setText(history.current[pointer.current]);
    }
  };
  const redo = () => {
    if (pointer.current < history.current.length - 1) {
      pointer.current += 1;
          isUserInput.current = false;
      setText(history.current[pointer.current]);
    }
  };

// Nur bei Benutzereingabe neuen Verlauf speichern
useEffect(() => {
  if (isUserInput.current) {
    const last = history.current[history.current.length - 1];
    if (last !== text) pushHistory(text);
  }
  isUserInput.current = true; // zurücksetzen
}, [text]);

  // Toolbar Funktionen
  const insertText = (before: string, after = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.slice(start, end);
    const newText =
      textarea.value.slice(0, start) +
      before +
      selected +
      after +
      textarea.value.slice(end);
    setText(newText);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    });
  };
  const insertLine = (line: string) => setText((t) => t + `\n${line}\n`);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            insertText("**", "**");
            break;
          case "i":
            e.preventDefault();
            insertText("_", "_");
            break;
          case "k":
            e.preventDefault();
            insertText("[", "](https://)");
            break;
          case "z":
            e.preventDefault();
            e.shiftKey ? redo() : undo();
            break;
          case "s":
            e.preventDefault();
            alert("✅ Automatisch gespeichert!");
            break;
        }
      }
    };
    globalThis.addEventListener("keydown", handleKey);
    return () => globalThis.removeEventListener("keydown", handleKey);
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    isUserInput.current = true;
    setText(e.target.value);
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="p-4 border-b dark:border-slate-800 flex justify-between items-center">
        <h1 className="font-bold text-lg">📝 Markdown Notes</h1>
        <div className="flex gap-2">
          <button
            onClick={undo}
            className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            ↶ Undo
          </button>
          <button
            onClick={redo}
            className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            ↷ Redo
          </button>
          <button
            onClick={() => setDark((d) => !d)}
            className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
        <button
          onClick={() => insertText("**", "**")}
          title="Fett (Ctrl+B)"
          className="px-2 py-1 text-sm rounded hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          **B**
        </button>
        <button
          onClick={() => insertText("_", "_")}
          title="Kursiv (Ctrl+I)"
          className="px-2 py-1 text-sm rounded hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          _I_
        </button>
        <button
          onClick={() => insertText("`", "`")}
          className="px-2 py-1 text-sm rounded hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          `Code`
        </button>
        <button
          onClick={() => insertLine("> Zitat")}
          className="px-2 py-1 text-sm rounded hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          &gt; Zitat
        </button>
        <button
          onClick={() => insertLine("- Listeneintrag")}
          className="px-2 py-1 text-sm rounded hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          • Liste
        </button>
        <button
          onClick={() => insertLine("# Überschrift")}
          className="px-2 py-1 text-sm rounded hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          # H1
        </button>
        <button
          onClick={() => insertLine("---")}
          className="px-2 py-1 text-sm rounded hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          ─ Linie
        </button>
        <button
          onClick={() => insertText("[Linktext](https://)", "")}
          className="px-2 py-1 text-sm rounded hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          🔗 Link
        </button>
      </div>

      {/* Inhalt mit verstellbarer Trennlinie */}
      <PanelGroup direction="horizontal" className="flex-1">
        {/* Editor */}
        <Panel defaultSize={50} minSize={20}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            className="w-full h-full p-4 font-mono text-sm bg-slate-50 dark:bg-slate-800 outline-none resize-none"
          />
        </Panel>

        {/* Trennlinie */}
        <PanelResizeHandle className="w-1 bg-slate-300 dark:bg-slate-700 hover:bg-blue-400 transition-colors cursor-col-resize" />

        {/* Vorschau */}
        <Panel defaultSize={50} minSize={20}>
          <div className="p-4 overflow-auto prose dark:prose-invert bg-slate-100 dark:bg-slate-950 h-full">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </div>
        </Panel>
      </PanelGroup>

      {/* Footer */}
      <footer className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400 py-2">
        Hergestellt mit ❤️ in React + TailwindCSS
      </footer>
    </div>
  );
}
