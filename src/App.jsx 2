import { useState, useEffect, useRef, useCallback } from "react";

const WALK_COLOR = "#4A9EE0";
const RUN_COLOR  = "#FF6B35";

const defaultShoes = [
  { id: 1, name: "Nike Pegasus 40", brand: "Nike", goal: 300, image: null, color: "#FF6B35", archived: false, log: [] },
  { id: 2, name: "Brooks Ghost 15", brand: "Brooks", goal: 400, image: null, color: "#4ECDC4", archived: false, log: [] },
];

// ── persistence ───────────────────────────────────────────────────
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  }, [key, value]);
  return [value, setValue];
}

// ── helpers ───────────────────────────────────────────────────────
function totals(shoe) {
  let walk = 0, run = 0;
  (shoe.log || []).forEach(e => { walk += e.walk; run += e.run; });
  return { walk, run, total: walk + run };
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

async function toBase64(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, 600 / img.width);
        const canvas = document.createElement("canvas");
        canvas.width  = img.width  * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── Ring canvas ───────────────────────────────────────────────────
function Ring({ shoe, size = 80 }) {
  const ref = useRef();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const { walk, run } = totals(shoe);
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width  = size + "px";
    canvas.style.height = size + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const cx = size / 2, cy = size / 2, r = size / 2 - 5, lw = 5.5;
    const full = 2 * Math.PI, start = -Math.PI / 2;
    ctx.lineCap = "round";
    ctx.lineWidth = lw;
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, full); ctx.stroke();
    const pW = Math.min(walk / shoe.goal, 1);
    const pR = Math.min(run  / shoe.goal, 1);
    if (pW > 0.005) {
      ctx.strokeStyle = WALK_COLOR;
      ctx.beginPath(); ctx.arc(cx, cy, r, start, start + full * pW); ctx.stroke();
    }
    if (pR > 0.005) {
      ctx.strokeStyle = RUN_COLOR;
      ctx.beginPath(); ctx.arc(cx, cy, r, start + full * pW, start + full * pW + full * pR); ctx.stroke();
    }
  }, [shoe, size]);
  return <canvas ref={ref} style={{ position: "absolute", top: 0, left: 0 }} />;
}

// ── Confirm modal ─────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#111", border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 20, padding: "28px 28px 22px", width: 300, maxWidth: "88vw",
      }}>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, marginBottom: 22, lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
            background: "#c0392b", color: "white", cursor: "pointer", fontSize: 14, fontWeight: 700,
          }}>Delete</button>
          <button onClick={onCancel} style={{
            flex: 1, padding: "10px 0", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.15)", background: "transparent",
            color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14,
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Add shoe modal ────────────────────────────────────────────────
function AddShoeModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ name: "", brand: "", goal: "300", color: "#FF6B35" });
  const colors = ["#FF6B35","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#7C5CBF","#F7DC6F"];
  const submit = () => {
    if (!form.name.trim()) return;
    onAdd({ name: form.name.trim(), brand: form.brand.trim(), goal: parseFloat(form.goal) || 300, color: form.color });
    onClose();
  };
  const s = {
    input: {
      width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10, color: "white", padding: "11px 14px", fontSize: 15,
      fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box", outline: "none",
    },
  };
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "linear-gradient(160deg,#1a1a2e,#16213e)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24,
        padding: 28, width: 340, maxWidth: "92vw",
      }}>
        <p style={{ fontSize: 20, fontWeight: 700, color: "white", marginBottom: 20 }}>New shoe</p>
        <input style={s.input} placeholder="Shoe name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input style={s.input} placeholder="Brand" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
        <input style={s.input} placeholder="Mileage goal" type="number" value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} />
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 2, marginBottom: 8 }}>ACCENT COLOR</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {colors.map(c => (
            <div key={c} onClick={() => setForm({ ...form, color: c })} style={{
              width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer",
              border: form.color === c ? "3px solid white" : "3px solid transparent",
              transform: form.color === c ? "scale(1.2)" : "scale(1)", transition: "transform .15s",
            }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={submit} style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
            background: form.color, color: "white", cursor: "pointer", fontWeight: 700, fontSize: 15,
          }}>Add shoe</button>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px 0", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
            color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 15,
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Edit shoe modal ───────────────────────────────────────────────
function EditShoeModal({ shoe, onSave, onClose }) {
  const t = totals(shoe);
  const [form, setForm] = useState({
    name: shoe.name, brand: shoe.brand, goal: String(shoe.goal), color: shoe.color,
    walk: t.walk.toFixed(1), run: t.run.toFixed(1),
  });
  const colors = ["#FF6B35","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#7C5CBF","#F7DC6F"];
  const s = {
    input: {
      width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10, color: "white", padding: "10px 13px", fontSize: 15,
      fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box", outline: "none",
    },
    label: { fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1.5, marginBottom: 5, display: "block" },
  };
  const save = () => {
    const newWalk = parseFloat(form.walk) || 0;
    const newRun  = parseFloat(form.run)  || 0;
    const diff = { walk: newWalk - t.walk, run: newRun - t.run };
    const newLog = diff.walk !== 0 || diff.run !== 0
      ? [...(shoe.log || []), { date: new Date().toISOString(), walk: diff.walk, run: diff.run, note: "Manual adjustment" }]
      : shoe.log;
    onSave({ name: form.name.trim(), brand: form.brand.trim(), goal: parseFloat(form.goal) || shoe.goal, color: form.color, log: newLog });
    onClose();
  };
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "linear-gradient(160deg,#1a1a2e,#16213e)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24,
        padding: 28, width: 340, maxWidth: "92vw", maxHeight: "88vh", overflowY: "auto",
      }}>
        <p style={{ fontSize: 20, fontWeight: 700, color: "white", marginBottom: 20 }}>Edit shoe</p>
        <input style={s.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Shoe name" />
        <input style={s.input} value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Brand" />
        <input style={s.input} type="number" value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} placeholder="Goal (mi)" />
        <p style={{ ...s.label, marginTop: 4 }}>OVERWRITE TOTALS</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ ...s.label, color: WALK_COLOR }}>Walk mi</label>
            <input style={{ ...s.input, marginBottom: 0, borderColor: WALK_COLOR + "44" }} type="number" min="0" step="0.1" value={form.walk} onChange={e => setForm({ ...form, walk: e.target.value })} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ ...s.label, color: RUN_COLOR }}>Run mi</label>
            <input style={{ ...s.input, marginBottom: 0, borderColor: RUN_COLOR + "44" }} type="number" min="0" step="0.1" value={form.run} onChange={e => setForm({ ...form, run: e.target.value })} />
          </div>
        </div>
        <p style={{ ...s.label, marginTop: 8 }}>ACCENT COLOR</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {colors.map(c => (
            <div key={c} onClick={() => setForm({ ...form, color: c })} style={{
              width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer",
              border: form.color === c ? "3px solid white" : "3px solid transparent",
              transform: form.color === c ? "scale(1.2)" : "scale(1)", transition: "transform .15s",
            }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={save} style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
            background: form.color, color: "white", cursor: "pointer", fontWeight: 700, fontSize: 15,
          }}>Save</button>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px 0", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
            color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 15,
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Shoe row card ─────────────────────────────────────────────────
function ShoeRow({ shoe, onUpdate, onArchive, onDelete }) {
  const [expanded, setExpanded]   = useState(false);
  const [logging,  setLogging]    = useState(false);
  const [walk,     setWalk]       = useState("");
  const [run,      setRun]        = useState("");
  const [editing,  setEditing]    = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const imgRef = useRef();

  const { walk: tw, run: tr, total } = totals(shoe);
  const pct = Math.min(total / shoe.goal * 100, 100).toFixed(0);
  const RING = 80;

  const handlePhoto = useCallback(async file => {
    if (!file) return;
    const b64 = await toBase64(file);
    onUpdate(shoe.id, { image: b64 });
  }, [shoe.id, onUpdate]);

  const handlePaste = useCallback(async e => {
    for (let item of (e.clipboardData?.items || [])) {
      if (item.type.startsWith("image/")) { await handlePhoto(item.getAsFile()); break; }
    }
  }, [handlePhoto]);

  const handleDrop = useCallback(async e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) await handlePhoto(file);
  }, [handlePhoto]);

  const logMiles = () => {
    const w = parseFloat(walk) || 0;
    const r = parseFloat(run)  || 0;
    if (!w && !r) return;
    onUpdate(shoe.id, { log: [...(shoe.log || []), { date: new Date().toISOString(), walk: w, run: r }] });
    setWalk(""); setRun(""); setLogging(false);
  };

  const rows = [...(shoe.log || [])].reverse().filter(e => e.walk || e.run);

  return (
    <>
      <div style={{
        background: "linear-gradient(135deg,#1a1a2e,#16213e)",
        border: `1px solid ${shoe.color}33`,
        borderRadius: 18, overflow: "hidden",
        boxShadow: `0 0 30px ${shoe.color}12`,
      }}>
        {/* accent top bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg,${shoe.color},${shoe.color}33)` }} />

        {/* main row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 14px 14px 14px" }}>

          {/* ring + photo */}
          <div style={{ position: "relative", width: RING, height: RING, flexShrink: 0 }}>
            <Ring shoe={shoe} size={RING} />
            <div
              onPaste={handlePaste}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              tabIndex={0}
              onClick={() => imgRef.current?.click()}
              style={{
                position: "absolute", top: 8, left: 8,
                width: RING - 16, height: RING - 16, borderRadius: "50%",
                overflow: "hidden", cursor: "pointer",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                outline: "none",
              }}
            >
              {shoe.image
                ? <img src={shoe.image} alt={shoe.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.3, padding: 4 }}>📷<br/>photo</span>
              }
              <input ref={imgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handlePhoto(e.target.files[0])} />
            </div>
            {/* pct label below ring */}
            <div style={{
              position: "absolute", bottom: -14, left: "50%", transform: "translateX(-50%)",
              fontSize: 10, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap",
            }}>{pct}%</div>
          </div>

          {/* info */}
          <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
            <div style={{ fontSize: 10, color: shoe.color, letterSpacing: 2, textTransform: "uppercase", marginBottom: 1 }}>{shoe.brand}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 7 }}>{shoe.name}</div>

            {/* tappable stat pills */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button onClick={() => { setLogging(l => !l); setExpanded(true); }} style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "4px 10px", borderRadius: 20,
                background: "rgba(74,158,224,0.12)", border: "1px solid rgba(74,158,224,0.25)",
                color: WALK_COLOR, fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>🚶 {tw.toFixed(1)} mi</button>
              <button onClick={() => { setLogging(l => !l); setExpanded(true); }} style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "4px 10px", borderRadius: 20,
                background: "rgba(255,107,53,0.12)", border: "1px solid rgba(255,107,53,0.25)",
                color: RUN_COLOR, fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>🏃 {tr.toFixed(1)} mi</button>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 5 }}>
              {total.toFixed(1)} of {shoe.goal} mi · {Math.max(0, shoe.goal - total).toFixed(1)} remaining
            </div>
          </div>

          {/* right controls */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button onClick={() => setEditing(true)} style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, color: "rgba(255,255,255,0.5)", cursor: "pointer",
              padding: "4px 8px", fontSize: 11,
            }}>Edit</button>
            <button onClick={() => setExpanded(e => !e)} style={{
              background: "none", border: "none", color: "rgba(255,255,255,0.3)",
              cursor: "pointer", fontSize: 18, lineHeight: 1,
              transform: expanded ? "rotate(180deg)" : "none", transition: "transform .2s",
            }}>⌄</button>
          </div>
        </div>

        {/* inline log entry */}
        {logging && (
          <div onClick={e => e.stopPropagation()} style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "12px 14px", background: "rgba(0,0,0,0.2)",
          }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 10, color: WALK_COLOR, letterSpacing: 1, marginBottom: 4 }}>WALK MI</label>
                <input
                  type="number" min="0" step="0.1" value={walk}
                  onChange={e => setWalk(e.target.value)}
                  autoFocus
                  placeholder="0.0"
                  style={{
                    width: "100%", background: "rgba(74,158,224,0.08)",
                    border: `1px solid ${WALK_COLOR}44`, borderRadius: 9,
                    color: "white", padding: "8px 10px", fontSize: 14,
                    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 10, color: RUN_COLOR, letterSpacing: 1, marginBottom: 4 }}>RUN MI</label>
                <input
                  type="number" min="0" step="0.1" value={run}
                  onChange={e => setRun(e.target.value)}
                  placeholder="0.0"
                  style={{
                    width: "100%", background: "rgba(255,107,53,0.08)",
                    border: `1px solid ${RUN_COLOR}44`, borderRadius: 9,
                    color: "white", padding: "8px 10px", fontSize: 14,
                    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
              <button onClick={logMiles} style={{
                padding: "8px 16px", borderRadius: 9, border: "none",
                background: shoe.color, color: "white", cursor: "pointer",
                fontSize: 13, fontWeight: 700, marginBottom: 1,
              }}>Log</button>
              <button onClick={() => setLogging(false)} style={{
                padding: "8px 10px", borderRadius: 9,
                border: "1px solid rgba(255,255,255,0.12)", background: "transparent",
                color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13, marginBottom: 1,
              }}>✕</button>
            </div>
          </div>
        )}

        {/* history */}
        {expanded && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "10px 14px 14px" }}>
            {rows.length === 0 ? (
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "8px 0" }}>
                No entries yet — tap walk or run to log
              </p>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, paddingBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span>Date &amp; time</span><span>Miles</span>
                </div>
                {rows.map((entry, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                      {entry.note ? <em style={{ color: "rgba(255,255,255,0.25)" }}>{entry.note} · </em> : null}
                      {fmtDate(entry.date)}
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {entry.walk ? <span style={{ fontSize: 12, color: WALK_COLOR, fontWeight: 600 }}>🚶 {entry.walk.toFixed(1)}</span> : null}
                      {entry.run  ? <span style={{ fontSize: 12, color: RUN_COLOR,  fontWeight: 600 }}>🏃 {entry.run.toFixed(1)}</span>  : null}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* archive / delete */}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={() => onArchive(shoe.id)} style={{
                flex: 1, padding: "7px 0", borderRadius: 9,
                border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 12, letterSpacing: 1,
              }}>Archive</button>
              <button onClick={() => setConfirmDel(true)} style={{
                padding: "7px 14px", borderRadius: 9,
                border: "1px solid rgba(192,57,43,0.35)", background: "rgba(192,57,43,0.1)",
                color: "rgba(220,80,60,0.85)", cursor: "pointer", fontSize: 12, letterSpacing: 1,
              }}>Delete</button>
            </div>
          </div>
        )}
      </div>

      {editing && (
        <EditShoeModal
          shoe={shoe}
          onSave={updates => onUpdate(shoe.id, updates)}
          onClose={() => setEditing(false)}
        />
      )}
      {confirmDel && (
        <ConfirmModal
          message={`Permanently delete "${shoe.name}"? This cannot be undone.`}
          onConfirm={() => { setConfirmDel(false); onDelete(shoe.id); }}
          onCancel={() => setConfirmDel(false)}
        />
      )}
    </>
  );
}

// ── Archived list ─────────────────────────────────────────────────
function ArchivedList({ shoes, onRestore, onDelete }) {
  const [confirmId, setConfirmId] = useState(null);
  if (!shoes.length) return (
    <div style={{ textAlign: "center", color: "rgba(255,255,255,0.22)", paddingTop: 60 }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
      <div style={{ fontSize: 14, letterSpacing: 1 }}>No archived shoes</div>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {shoes.map(shoe => {
        const { walk, run, total } = totals(shoe);
        return (
          <div key={shoe.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, padding: "12px 14px",
          }}>
            {shoe.image && <img src={shoe.image} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} alt="" />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: shoe.color, letterSpacing: 2 }}>{shoe.brand.toUpperCase()}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shoe.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                🚶 {walk.toFixed(1)} · 🏃 {run.toFixed(1)} · {total.toFixed(1)} mi total
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <button onClick={() => onRestore(shoe.id)} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 7, color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: "4px 10px", fontSize: 11,
              }}>Restore</button>
              <button onClick={() => setConfirmId(shoe.id)} style={{
                background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)",
                borderRadius: 7, color: "rgba(220,80,60,0.85)", cursor: "pointer", padding: "4px 10px", fontSize: 11,
              }}>Delete</button>
            </div>
          </div>
        );
      })}
      {confirmId && (
        <ConfirmModal
          message={`Permanently delete "${shoes.find(s => s.id === confirmId)?.name}"?`}
          onConfirm={() => { onDelete(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}

// ── App root ──────────────────────────────────────────────────────
export default function App() {
  const [shoes,  setShoes]  = useLocalStorage("solelog-shoes",  defaultShoes);
  const [nextId, setNextId] = useLocalStorage("solelog-nextid", 3);
  const [tab,    setTab]    = useState("active");
  const [showAdd, setShowAdd] = useState(false);

  const active   = shoes.filter(s => !s.archived);
  const archived = shoes.filter(s =>  s.archived);

  const updateShoe  = (id, updates) => setShoes(s => s.map(sh => sh.id === id ? { ...sh, ...updates } : sh));
  const archiveShoe = (id) => setShoes(s => s.map(sh => sh.id === id ? { ...sh, archived: true } : sh));
  const deleteShoe  = (id) => setShoes(s => s.filter(sh => sh.id !== id));
  const restoreShoe = (id) => setShoes(s => s.map(sh => sh.id === id ? { ...sh, archived: false } : sh));
  const addShoe     = data => {
    setShoes(s => [...s, { id: nextId, log: [], image: null, archived: false, ...data }]);
    setNextId(n => n + 1);
    setTab("active");
  };

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 20% 0%,#0f3460 0%,#0a0a0f 50%,#0f0a1e 100%)" }}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      {/* header */}
      <div style={{ padding: "26px 20px 0", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", letterSpacing: 5, marginBottom: 3, fontFamily: "'Barlow Condensed', sans-serif" }}>MILEAGE TRACKER</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "white", letterSpacing: -0.5, lineHeight: 1, fontFamily: "'Barlow Condensed', sans-serif" }}>
              SOLE<span style={{ color: "#FF6B35" }}>LOG</span>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#FF6B35", border: "none", borderRadius: 14,
            color: "white", padding: "10px 18px", cursor: "pointer",
            fontWeight: 800, fontSize: 14, fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: 1, boxShadow: "0 4px 18px rgba(255,107,53,0.35)",
          }}>+ ADD</button>
        </div>

        {/* tabs */}
        <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 4, marginBottom: 16 }}>
          {[["active", active.length], ["archived", archived.length]].map(([t, count]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "8px 0", borderRadius: 9, border: "none",
              background: tab === t ? "rgba(255,255,255,0.1)" : "transparent",
              color: tab === t ? "white" : "rgba(255,255,255,0.28)",
              cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13, letterSpacing: 2, fontWeight: tab === t ? 700 : 400, transition: "all .2s",
            }}>
              {t.toUpperCase()} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* list */}
      <div style={{ padding: "0 20px 40px", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {tab === "active" ? (
          active.length === 0 ? (
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.22)", paddingTop: 60 }}>
              <div style={{ fontSize: 42, marginBottom: 10 }}>👟</div>
              <div style={{ fontSize: 14, letterSpacing: 1 }}>No active shoes — tap + ADD</div>
            </div>
          ) : active.map(shoe => (
            <ShoeRow
              key={shoe.id}
              shoe={shoe}
              onUpdate={updateShoe}
              onArchive={archiveShoe}
              onDelete={deleteShoe}
            />
          ))
        ) : (
          <ArchivedList shoes={archived} onRestore={restoreShoe} onDelete={deleteShoe} />
        )}
      </div>

      {showAdd && <AddShoeModal onAdd={addShoe} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
