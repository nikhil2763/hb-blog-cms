"use client";

import { useState } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";

// Adds https:// to bare domains and rejects javascript:/data: style URLs.
function normalizeUrl(raw) {
  const url = raw.trim();
  if (!url) return null;
  if (url.startsWith("/") || url.startsWith("#")) return url;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`;
  return /^(https?:|mailto:|tel:)/i.test(withScheme) ? withScheme : null;
}

function ToolButton({ active, onClick, title, children, disabled }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={!!active}
      disabled={disabled}
      className={`tool-btn${active ? " is-active" : ""}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function LinkPanel({ editor, onClose }) {
  const current = editor.getAttributes("link");
  const isEditing = editor.isActive("link");
  const hasSelection = !editor.state.selection.empty;
  const [url, setUrl] = useState(current.href || "");
  const [text, setText] = useState("");
  const [newTab, setNewTab] = useState(isEditing ? current.target === "_blank" : true);
  const [error, setError] = useState("");

  const apply = () => {
    const href = normalizeUrl(url);
    if (!href) {
      setError("Enter a valid URL (https://…, /path, mailto: or tel:).");
      return;
    }
    const attrs = { href, target: newTab ? "_blank" : null, rel: newTab ? "noopener noreferrer" : null };
    const chain = editor.chain().focus();
    if (isEditing) {
      chain.extendMarkRange("link").setLink(attrs).run();
    } else if (hasSelection) {
      chain.setLink(attrs).run();
    } else {
      chain
        .insertContent({ type: "text", text: text.trim() || href, marks: [{ type: "link", attrs }] })
        .unsetMark("link")
        .insertContent(" ")
        .run();
    }
    onClose();
  };

  const remove = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onClose();
  };

  return (
    <div className="link-panel" role="dialog" aria-label={isEditing ? "Edit link" : "Insert link"}>
      <strong>{isEditing ? "Edit link" : "Insert link"}</strong>
      <label>
        URL
        <input
          autoFocus
          type="text"
          value={url}
          placeholder="https://example.com"
          onChange={(e) => { setUrl(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } }}
        />
      </label>
      {!isEditing && !hasSelection && (
        <label>
          Link text
          <input type="text" value={text} placeholder="Text to display" onChange={(e) => setText(e.target.value)} />
        </label>
      )}
      <fieldset className="link-target">
        <legend>Open link in</legend>
        <label><input type="radio" name="link-target" checked={newTab} onChange={() => setNewTab(true)} /> New tab</label>
        <label><input type="radio" name="link-target" checked={!newTab} onChange={() => setNewTab(false)} /> Same tab</label>
      </fieldset>
      {error && <p className="field-error">{error}</p>}
      <div className="link-actions">
        <button type="button" className="btn btn-primary btn-sm" onClick={apply}>{isEditing ? "Update link" : "Insert link"}</button>
        {isEditing && <button type="button" className="btn btn-danger btn-sm" onClick={remove}>Remove link</button>}
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default function RichTextEditor({ value, onChange, invalid }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [textColor, setTextColor] = useState("#e11d48");
  const [bgColor, setBgColor] = useState("#fde047");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        protocols: ["mailto", "tel"],
        HTMLAttributes: { target: null, rel: null },
      }),
    ],
    content: value || "",
    editorProps: { attributes: { class: "editor-content prose", "aria-label": "Blog description" } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  if (!editor) return <div className="editor editor-loading">Loading editor…</div>;

  const link = editor.getAttributes("link");
  const chain = () => editor.chain().focus();

  return (
    <div className={`editor${invalid ? " is-invalid" : ""}`}>
      <div className="toolbar" role="toolbar" aria-label="Formatting">
        <ToolButton title="Bold (Ctrl+B)" active={editor.isActive("bold")} onClick={() => chain().toggleBold().run()}><b>B</b></ToolButton>
        <ToolButton title="Italic (Ctrl+I)" active={editor.isActive("italic")} onClick={() => chain().toggleItalic().run()}><i>I</i></ToolButton>
        <ToolButton title="Underline (Ctrl+U)" active={editor.isActive("underline")} onClick={() => chain().toggleUnderline().run()}><u>U</u></ToolButton>
        <span className="tool-sep" />

        <label className="color-tool" title="Text colour">
          <span className="swatch-letter" style={{ color: textColor }}>A</span>
          <input type="color" value={textColor} aria-label="Text colour"
            onChange={(e) => { setTextColor(e.target.value); chain().setColor(e.target.value).run(); }} />
        </label>
        <ToolButton title="Remove text colour" onClick={() => chain().unsetColor().run()}>A̸</ToolButton>

        <label className="color-tool" title="Highlight (background colour)">
          <span className="swatch-letter" style={{ background: bgColor, color: "#111" }}>H</span>
          <input type="color" value={bgColor} aria-label="Highlight colour"
            onChange={(e) => { setBgColor(e.target.value); chain().setHighlight({ color: e.target.value }).run(); }} />
        </label>
        <ToolButton title="Remove highlight" onClick={() => chain().unsetHighlight().run()}>H̸</ToolButton>
        <span className="tool-sep" />

        <ToolButton title={editor.isActive("link") ? "Edit link" : "Insert link"} active={editor.isActive("link") || linkOpen} onClick={() => setLinkOpen((o) => !o)}>🔗</ToolButton>
        <ToolButton title="Remove link" disabled={!editor.isActive("link")} onClick={() => chain().extendMarkRange("link").unsetLink().run()}>✂︎</ToolButton>
        <span className="tool-sep" />

        <ToolButton title="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()}>H2</ToolButton>
        <ToolButton title="Subheading" active={editor.isActive("heading", { level: 3 })} onClick={() => chain().toggleHeading({ level: 3 }).run()}>H3</ToolButton>
        <ToolButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => chain().toggleBulletList().run()}>•≡</ToolButton>
        <ToolButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => chain().toggleOrderedList().run()}>1≡</ToolButton>
        <ToolButton title="Quote" active={editor.isActive("blockquote")} onClick={() => chain().toggleBlockquote().run()}>❝</ToolButton>
        <span className="tool-sep" />
        <ToolButton title="Undo" disabled={!editor.can().undo()} onClick={() => chain().undo().run()}>↶</ToolButton>
        <ToolButton title="Redo" disabled={!editor.can().redo()} onClick={() => chain().redo().run()}>↷</ToolButton>
      </div>

      {linkOpen && <LinkPanel key={`${link.href}-${editor.state.selection.from}`} editor={editor} onClose={() => setLinkOpen(false)} />}

      {/* BubbleMenu moves its node into <body>; the wrapper keeps React's sibling order stable. */}
      <div>
        <BubbleMenu editor={editor} shouldShow={({ editor }) => editor.isActive("link")} tippyOptions={{ placement: "bottom-start" }}>
          {!linkOpen && (
            <div className="link-bubble" onMouseDown={(e) => e.target.tagName === "BUTTON" && e.preventDefault()}>
              <a href={link.href} target="_blank" rel="noopener noreferrer">{link.href}</a>
              <span className="badge">{link.target === "_blank" ? "New tab" : "Same tab"}</span>
              <button type="button" onClick={() => setLinkOpen(true)}>Edit</button>
              <button type="button" onClick={() => chain().extendMarkRange("link").unsetLink().run()}>Remove</button>
            </div>
          )}
        </BubbleMenu>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
