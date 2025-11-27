import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function Entries() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("lavendrlaneEntries") || "[]");
    setEntries(saved);
  }, []);

  const refresh = () => {
    setEntries(JSON.parse(localStorage.getItem("lavendrlaneEntries") || "[]"));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this entry?")) return;
    const newEntries = entries.filter(e => e.id !== id);
    localStorage.setItem("lavendrlaneEntries", JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  const handleEdit = (entry) => {
    const draft = {
      title: entry.title,
      contentHTML: entry.content,
      mood: entry.mood,
      stickers: entry.stickers || [],
      canvasDataUrl: entry.canvas || null,
    };
    localStorage.setItem("lavendrlaneDraft", JSON.stringify(draft));
    // remove entry we will re-save on save
    const remaining = entries.filter(e => e.id !== entry.id);
    localStorage.setItem("lavendrlaneEntries", JSON.stringify(remaining));
    navigate("/journal");
  };

  const exportHtml = (entry) => {
    const html = `<html><head><meta charset="utf-8"><title>${entry.title}</title></head><body>${entry.content}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(entry.title || "lavendrlane-entry").replace(/\s+/g,'-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="lavender-container">
      <div className="entries-header">
        <h1>📚 My Entries</h1>
        <div className="entries-actions">
          <button onClick={() => { localStorage.removeItem("lavendrlaneEntries"); refresh(); }}>Clear All</button>
        </div>
      </div>

      {entries.length === 0 ? (
        <p>No saved entries yet — write one in <button onClick={() => navigate("/journal")}>Journal</button>.</p>
      ) : (
        entries.map((e) => (
          <div key={e.id} className="entry-card">
            <div className="entry-meta">
              <strong>{e.title}</strong>
              <span>{e.date}</span>
            </div>
            <div className="entry-body" dangerouslySetInnerHTML={{ __html: e.content }} />
            {e.canvas && <img src={e.canvas} alt="doodle" className="entry-canvas" />}
            <div className="entry-actions">
              <button onClick={() => handleEdit(e)}>✏️ Edit</button>
              <button onClick={() => exportHtml(e)}>⬇️ Export</button>
              <button onClick={() => handleDelete(e.id)}>🗑️ Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
