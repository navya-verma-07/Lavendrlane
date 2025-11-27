import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

/* Journal: create/edit entry, doodle, stickers, autosave draft to localStorage */
export default function Journal() {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  const [title, setTitle] = useState("");
  const [contentHTML, setContentHTML] = useState("<p></p>");
  const [mood, setMood] = useState("🌷");
  const [stickers, setStickers] = useState([]);
  const [penColor, setPenColor] = useState("#7a42f4");
  const [canvasDataUrl, setCanvasDataUrl] = useState(null);

  // Load draft (for editing existing entries or previous draft)
  useEffect(() => {
    const draft = JSON.parse(localStorage.getItem("lavendrlaneDraft") || "null");
    if (draft) {
      setTitle(draft.title || "");
      setContentHTML(draft.contentHTML || "<p></p>");
      setMood(draft.mood || "🌷");
      setStickers(draft.stickers || []);
      setCanvasDataUrl(draft.canvasDataUrl || null);
      if (editorRef.current) editorRef.current.innerHTML = draft.contentHTML || "<p></p>";
    }
  }, []);

  // Autosave draft every 2s
  useEffect(() => {
    const saver = setInterval(() => {
      const draft = {
        title,
        contentHTML: editorRef.current ? editorRef.current.innerHTML : contentHTML,
        mood,
        stickers,
        canvasDataUrl,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem("lavendrlaneDraft", JSON.stringify(draft));
    }, 2000);
    return () => clearInterval(saver);
  }, [title, contentHTML, mood, stickers, canvasDataUrl]);

  // Exec format commands in contentEditable
  const exec = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    if (editorRef.current) setContentHTML(editorRef.current.innerHTML);
  };

  // Stickers
  const addSticker = (s) => {
    setStickers(prev => [...prev, s]);
    if (editorRef.current) {
      const node = document.createTextNode(" " + s + " ");
      editorRef.current.appendChild(node);
      setContentHTML(editorRef.current.innerHTML);
    }
  };

  // Canvas draw handlers
  const startDraw = (e) => {
    drawingRef.current = true;
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    draw(e);
  };
  const endDraw = () => {
    drawingRef.current = false;
    if (!canvasRef.current) return;
    const data = canvasRef.current.toDataURL("image/png");
    setCanvasDataUrl(data);
  };
  const draw = (e) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = penColor;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasDataUrl(null);
  };

  // Save entry to localStorage entries list
  const saveEntry = () => {
    const entries = JSON.parse(localStorage.getItem("lavendrlaneEntries") || "[]");
    const content = editorRef.current ? editorRef.current.innerHTML : contentHTML;
    if ((!content || content === "<p></p>") && stickers.length === 0 && !canvasDataUrl) {
      alert("Write something or add a sticker/doodle before saving.");
      return;
    }
    const newEntry = {
      id: Date.now(),
      title: title || new Date().toLocaleString(),
      content,
      mood,
      stickers,
      canvas: canvasDataUrl,
      date: new Date().toLocaleString(),
    };
    entries.unshift(newEntry);
    localStorage.setItem("lavendrlaneEntries", JSON.stringify(entries));
    // clear draft and form
    localStorage.removeItem("lavendrlaneDraft");
    setTitle("");
    if (editorRef.current) editorRef.current.innerHTML = "<p></p>";
    setContentHTML("<p></p>");
    setStickers([]);
    clearCanvas();
    navigate("/entries");
  };

  return (
    <div className="lavender-container journal-page">
      <div className="journal-top">
        <button className="back-button" onClick={() => navigate("/")}>⬅ back</button>
        <div className="meta">
          <input className="title-input" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="mood-select">Mood:
            <select value={mood} onChange={(e) => setMood(e.target.value)}>
              <option>🌷</option><option>😊</option><option>🫠</option><option>😌</option><option>💫</option><option>😴</option><option>🤍</option><option>🫶</option>
            </select>
          </div>
        </div>
      </div>

      <div className="toolbar editor-toolbar">
        <button onClick={() => exec("bold")}>B</button>
        <button onClick={() => exec("italic")}>I</button>
        <button onClick={() => exec("underline")}>U</button>
        <button onClick={() => exec("insertUnorderedList")}>• list</button>
        <button onClick={() => exec("justifyLeft")}>L</button>
        <button onClick={() => exec("justifyCenter")}>C</button>
        <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} title="pen color" />
        <div className="sticker-actions">
          <button onClick={() => addSticker("💜")}>💜</button>
          <button onClick={() => addSticker("🌸")}>🌸</button>
          <button onClick={() => addSticker("🧸")}>🧸</button>
          <button onClick={() => addSticker("☁️")}>☁️</button>
        </div>
      </div>

      <div className="editor-area">
        <div
          ref={editorRef}
          className="content-editable"
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => setContentHTML(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: contentHTML }}
        />
        <div className="right-panel">
          <label>Canvas doodle</label>
          <canvas ref={canvasRef} width={360} height={180} className="doodle-canvas"
            onMouseDown={startDraw} onMouseUp={endDraw} onMouseMove={draw} onMouseLeave={endDraw}
            onTouchStart={startDraw} onTouchEnd={endDraw} onTouchMove={draw}
          />
          <div className="canvas-controls">
            <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} />
            <button onClick={clearCanvas}>clear</button>
            <button onClick={() => {
              const canvas = canvasRef.current;
              setCanvasDataUrl(canvas.toDataURL("image/png"));
              alert("Saved doodle to draft");
            }}>save doodle</button>
          </div>
        </div>
      </div>

      <div className="editor-actions">
        <button className="save-button" onClick={saveEntry}>Save Entry 💾</button>
      </div>
    </div>
  );
}
