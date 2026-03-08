import { useState, useRef, useCallback, useEffect } from "react";

const defaultShoes = [
  { id: 1, name: "Nike Pegasus 40", brand: "Nike", goal: 300, walking: 42.3, running: 88.7, image: null, color: "#FF6B35", archived: false },
  { id: 2, name: "Brooks Ghost 15", brand: "Brooks", goal: 400, walking: 15.1, running: 210.4, image: null, color: "#4ECDC4", archived: false },
];

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* quota exceeded or private mode */ }
  }, [key, value]);
  return [value, setValue];
}

function CircleProgress({ value, max, color, size = 80 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = pct * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={6} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
      backdropFilter: "blur(6px)"
    }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "linear-gradient(160deg, #1a1a2e, #16213e)", border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 20, padding: "28px 28px 24px", width: 300, maxWidth: "88vw",
        fontFamily: "'Barlow Condensed', sans-serif",
        boxShadow: "0 30px 80px rgba(0,0,0,0.9)"
      }}>
        <div style={{ fontSize: 17, color: "rgba(255,255,255,0.85)", marginBottom: 24, lineHeight: 1.5 }}>{message}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
            background: "#c0392b", color: "white", cursor: "pointer", fontWeight: 800,
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, letterSpacing: 2
          }}>DELETE</button>
          <button onClick={onCancel} style={{
            flex: 1, padding: "10px 0", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.15)", background: "transparent",
            color: "rgba(255,255,255,0.5)", cursor: "pointer",
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, letterSpacing: 2
          }}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}

function ShoeCard({ shoe, onUpdate, onArchive, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: shoe.name, brand: shoe.brand, goal: shoe.goal, color: shoe.color, walking: shoe.walking, running: shoe.running });
  const [addWalk, setAddWalk] = useState("");
  const [addRun, setAddRun] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const imgRef = useRef();

  const total = shoe.walking + shoe.running;
  const pct = Math.min(total / shoe.goal * 100, 100).toFixed(0);

  const handleImagePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let item of items) {
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        onUpdate(shoe.id, { image: URL.createObjectURL(blob) });
        break;
      }
    }
  }, [shoe.id, onUpdate]);

  const handleImageDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onUpdate(shoe.id, { image: URL.createObjectURL(file) });
    }
  }, [shoe.id, onUpdate]);

  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (file) onUpdate(shoe.id, { image: URL.createObjectURL(file) });
  };

  const logMiles = () => {
    const w = parseFloat(addWalk) || 0;
    const r = parseFloat(addRun) || 0;
    if (w || r) {
      onUpdate(shoe.id, { walking: shoe.walking + w, running: shoe.running + r });
      setAddWalk(""); setAddRun("");
    }
  };

  const saveEdit = () => {
    onUpdate(shoe.id, {
      ...form,
      goal: parseFloat(form.goal) || shoe.goal,
      walking: parseFloat(form.walking) ?? shoe.walking,
      running: parseFloat(form.running) ?? shoe.running,
    });
    setEditing(false);
  };

  return (
    <div style={{
      width: "100%", maxWidth: 420,
      background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
      borderRadius: 28,
      border: `1px solid ${shoe.color}33`,
      boxShadow: `0 0 40px ${shoe.color}18, 0 20px 60px rgba(0,0,0,0.7)`,
      overflow: "hidden",
      fontFamily: "'Barlow Condensed', sans-serif",
    }}>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${shoe.color}, ${shoe.color}33)` }} />

      {/* Image zone */}
      <div
        onPaste={handleImagePaste}
        onDrop={handleImageDrop}
        onDragOver={e => e.preventDefault()}
        tabIndex={0}
        onClick={() => !shoe.image && imgRef.current?.click()}
        style={{
          height: 180,
          background: shoe.image ? "transparent" : `radial-gradient(ellipse at 50% 50%, ${shoe.color}12, #000 70%)`,
          position: "relative",
          cursor: shoe.image ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          borderBottom: `1px solid ${shoe.color}1a`,
          outline: "none",
        }}
      >
        {shoe.image ? (
          <img src={shoe.image} alt="shoe" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", letterSpacing: 2 }}>
            <div style={{ fontSize: 42, marginBottom: 8 }}>👟</div>
            <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 3 }}>
              Click, paste, or drop image
            </div>
          </div>
        )}
        {shoe.image && (
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate(shoe.id, { image: null }); }}
            style={{
              position: "absolute", top: 10, right: 10,
              background: "rgba(0,0,0,0.7)", border: "none",
              borderRadius: "50%", width: 28, height: 28,
              color: "white", cursor: "pointer", fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >×</button>
        )}
        <input ref={imgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageFile} />
      </div>

      {/* Content */}
      <div style={{ padding: "20px 24px 24px" }}>
        {editing ? (
          <div style={{ marginBottom: 16 }}>
            {[
              { key: "name", placeholder: "Shoe name", fontSize: 16 },
              { key: "brand", placeholder: "Brand", fontSize: 14 },
            ].map(f => (
              <input key={f.key} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                placeholder={f.placeholder}
                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${shoe.color}44`,
                  borderRadius: 8, color: "white", padding: "8px 12px", fontSize: f.fontSize,
                  fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 8, boxSizing: "border-box", outline: "none" }}
              />
            ))}
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input value={form.goal} onChange={e => setForm({...form, goal: e.target.value})}
                placeholder="Goal (mi)" type="number"
                style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: `1px solid ${shoe.color}44`,
                  borderRadius: 8, color: "white", padding: "8px 12px", fontSize: 14,
                  fontFamily: "'Barlow Condensed', sans-serif", boxSizing: "border-box", outline: "none" }}
              />
              <input value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                type="color"
                style={{ width: 44, height: 38, borderRadius: 8, border: "none", cursor: "pointer", background: "none" }}
              />
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 2, marginBottom: 6 }}>OVERWRITE TOTALS</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "#7EB8F7", letterSpacing: 1, marginBottom: 3 }}>🚶 WALK MI</div>
                <input value={form.walking} onChange={e => setForm({...form, walking: e.target.value})}
                  type="number" min="0" step="0.1"
                  style={{ width: "100%", background: "rgba(126,184,247,0.08)", border: `1px solid #7EB8F744`,
                    borderRadius: 8, color: "white", padding: "8px 12px", fontSize: 14,
                    fontFamily: "'Barlow Condensed', sans-serif", boxSizing: "border-box", outline: "none" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "#FF6B6B", letterSpacing: 1, marginBottom: 3 }}>🏃 RUN MI</div>
                <input value={form.running} onChange={e => setForm({...form, running: e.target.value})}
                  type="number" min="0" step="0.1"
                  style={{ width: "100%", background: "rgba(255,107,107,0.08)", border: `1px solid #FF6B6B44`,
                    borderRadius: 8, color: "white", padding: "8px 12px", fontSize: 14,
                    fontFamily: "'Barlow Condensed', sans-serif", boxSizing: "border-box", outline: "none" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveEdit} style={{
                flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
                background: shoe.color, color: "white", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 1
              }}>SAVE</button>
              <button onClick={() => setEditing(false)} style={{
                flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
                background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, letterSpacing: 1
              }}>CANCEL</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 11, color: shoe.color, letterSpacing: 4, textTransform: "uppercase", marginBottom: 2 }}>{shoe.brand}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: "white", letterSpacing: 0.5, lineHeight: 1.1 }}>{shoe.name}</div>
            </div>
            <button onClick={() => setEditing(true)} style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, color: "rgba(255,255,255,0.5)", cursor: "pointer",
              padding: "4px 10px", fontSize: 12, letterSpacing: 1,
              fontFamily: "'Barlow Condensed', sans-serif"
            }}>EDIT</button>
          </div>
        )}

        {/* Progress ring + stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, margin: "16px 0" }}>
          <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
            <CircleProgress value={total} max={shoe.goal} color={shoe.color} size={80} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "white" }}>{pct}%</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <StatBit label="🚶 Walk" value={shoe.walking} color="#7EB8F7" />
              <StatBit label="🏃 Run" value={shoe.running} color="#FF6B6B" />
              <StatBit label="📍 Total" value={total} color={shoe.color} />
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>
              {Math.max(0, shoe.goal - total).toFixed(1)} mi to goal ({shoe.goal} mi)
            </div>
          </div>
        </div>

        <MileBar label="Walk" value={shoe.walking} total={total} color="#7EB8F7" />
        <MileBar label="Run" value={shoe.running} total={total} color="#FF6B6B" />

        {/* Log miles */}
        <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
          <NumInput value={addWalk} onChange={setAddWalk} placeholder="Walk mi" color="#7EB8F7" />
          <NumInput value={addRun} onChange={setAddRun} placeholder="Run mi" color="#FF6B6B" />
          <button onClick={logMiles} style={{
            padding: "9px 16px", borderRadius: 10, border: "none",
            background: `linear-gradient(135deg, ${shoe.color}, ${shoe.color}bb)`,
            color: "white", cursor: "pointer", fontWeight: 700,
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
            letterSpacing: 1, whiteSpace: "nowrap",
            boxShadow: `0 4px 16px ${shoe.color}33`
          }}>+ LOG</button>
        </div>

        {/* Archive + Delete */}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={() => onArchive(shoe.id)} style={{
            flex: 1, padding: "8px 0", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)",
            cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 13, letterSpacing: 2, textTransform: "uppercase"
          }}>Archive</button>
          <button onClick={() => setConfirmDelete(true)} style={{
            padding: "8px 16px", borderRadius: 10,
            border: "1px solid rgba(192,57,43,0.35)",
            background: "rgba(192,57,43,0.1)", color: "rgba(220,80,60,0.85)",
            cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 13, letterSpacing: 2, textTransform: "uppercase"
          }}>Delete</button>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmModal
          message={`Permanently delete "${shoe.name}"? This cannot be undone.`}
          onConfirm={() => { setConfirmDelete(false); onDelete(shoe.id); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

function StatBit({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 19, fontWeight: 800, color }}>{value.toFixed(1)}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>mi</div>
    </div>
  );
}

function MileBar({ label, value, total, color }) {
  const pct = total > 0 ? (value / total * 100) : 0;
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 3, letterSpacing: 1 }}>
        <span>{label.toUpperCase()}</span><span>{value.toFixed(1)} mi</span>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

function NumInput({ value, onChange, placeholder, color }) {
  return (
    <input
      type="number" min="0" step="0.1"
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        flex: 1, background: "rgba(255,255,255,0.06)",
        border: `1px solid ${color}44`, borderRadius: 10,
        color: "white", padding: "9px 10px", fontSize: 14,
        fontFamily: "'Barlow Condensed', sans-serif",
        outline: "none", boxSizing: "border-box"
      }}
    />
  );
}

function AddShoeModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ name: "", brand: "", goal: "300", color: "#FF6B35" });
  const submit = () => {
    if (!form.name.trim()) return;
    onAdd({ name: form.name, brand: form.brand, goal: parseFloat(form.goal) || 300, color: form.color });
    onClose();
  };
  const colors = ["#FF6B35","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#98D8C8","#F7DC6F"];
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      backdropFilter: "blur(8px)"
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "linear-gradient(160deg, #1a1a2e, #16213e)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24, padding: 32, width: 340, maxWidth: "90vw",
        fontFamily: "'Barlow Condensed', sans-serif",
        boxShadow: "0 30px 80px rgba(0,0,0,0.95)"
      }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "white", letterSpacing: 1, marginBottom: 24 }}>NEW SHOE</div>
        {[
          { key: "name", placeholder: "Shoe name *", type: "text" },
          { key: "brand", placeholder: "Brand", type: "text" },
          { key: "goal", placeholder: "Mileage goal", type: "number" },
        ].map(f => (
          <input key={f.key} type={f.type} placeholder={f.placeholder} value={form[f.key]}
            onChange={e => setForm({...form, [f.key]: e.target.value})}
            style={{
              width: "100%", background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
              color: "white", padding: "11px 14px", fontSize: 16,
              fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 12, boxSizing: "border-box",
              outline: "none"
            }}
          />
        ))}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 8 }}>ACCENT COLOR</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {colors.map(c => (
              <div key={c} onClick={() => setForm({...form, color: c})}
                style={{
                  width: 30, height: 30, borderRadius: "50%", background: c, cursor: "pointer",
                  border: form.color === c ? "3px solid white" : "3px solid transparent",
                  transition: "transform 0.15s", transform: form.color === c ? "scale(1.2)" : "scale(1)"
                }}
              />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={submit} style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
            background: `linear-gradient(135deg, ${form.color}, ${form.color}bb)`,
            color: "white", cursor: "pointer", fontWeight: 800,
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 17, letterSpacing: 2
          }}>ADD SHOE</button>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px 0", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
            color: "rgba(255,255,255,0.4)", cursor: "pointer",
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 17, letterSpacing: 2
          }}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}

function ArchivedList({ shoes, onRestore, onDelete }) {
  const [confirmId, setConfirmId] = useState(null);
  if (shoes.length === 0) return (
    <div style={{ textAlign: "center", color: "rgba(255,255,255,0.22)", paddingTop: 60, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 2 }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
      <div>NO ARCHIVED SHOES</div>
    </div>
  );
  const confirmShoe = shoes.find(s => s.id === confirmId);
  return (
    <div style={{ padding: "0 20px" }}>
      {shoes.map(shoe => {
        const total = shoe.walking + shoe.running;
        return (
          <div key={shoe.id} style={{
            display: "flex", alignItems: "center", gap: 16,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, padding: "14px 18px", marginBottom: 12,
            fontFamily: "'Barlow Condensed', sans-serif"
          }}>
            {shoe.image && <img src={shoe.image} style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} alt="" />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: shoe.color, letterSpacing: 3 }}>{shoe.brand.toUpperCase()}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shoe.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                🚶 {shoe.walking.toFixed(1)} · 🏃 {shoe.running.toFixed(1)} · 📍 {total.toFixed(1)} mi
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
              <button onClick={() => onRestore(shoe.id)} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, color: "rgba(255,255,255,0.6)", cursor: "pointer",
                padding: "5px 10px", fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 11, letterSpacing: 1
              }}>RESTORE</button>
              <button onClick={() => setConfirmId(shoe.id)} style={{
                background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)",
                borderRadius: 8, color: "rgba(220,80,60,0.85)", cursor: "pointer",
                padding: "5px 10px", fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 11, letterSpacing: 1
              }}>DELETE</button>
            </div>
          </div>
        );
      })}
      {confirmId && confirmShoe && (
        <ConfirmModal
          message={`Permanently delete "${confirmShoe.name}"? This cannot be undone.`}
          onConfirm={() => { onDelete(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  const [shoes, setShoes] = useLocalStorage('solelog-shoes', defaultShoes);
  const [nextId, setNextId] = useLocalStorage('solelog-nextid', 3);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [tab, setTab] = useState("active");
  const [showAdd, setShowAdd] = useState(false);
  const [swipeStart, setSwipeStart] = useState(null);

  const activeShoes = shoes.filter(s => !s.archived);
  const archivedShoes = shoes.filter(s => s.archived);
  const safeIdx = Math.min(currentIdx, Math.max(0, activeShoes.length - 1));

  const updateShoe = (id, updates) => setShoes(s => s.map(sh => sh.id === id ? { ...sh, ...updates } : sh));
  const archiveShoe = (id) => {
    setShoes(s => s.map(sh => sh.id === id ? { ...sh, archived: true } : sh));
    setCurrentIdx(i => Math.max(0, i - 1));
  };
  const deleteShoe = (id) => {
    setShoes(s => s.filter(sh => sh.id !== id));
    setCurrentIdx(i => Math.max(0, i - 1));
  };
  const restoreShoe = (id) => setShoes(s => s.map(sh => sh.id === id ? { ...sh, archived: false } : sh));
  const addShoe = (data) => {
    setShoes(s => [...s, { id: nextId, walking: 0, running: 0, image: null, archived: false, ...data }]);
    setNextId(n => n + 1);
    setCurrentIdx(activeShoes.length);
    setTab("active");
  };

  const prev = () => setCurrentIdx(i => Math.max(0, i - 1));
  const next = () => setCurrentIdx(i => Math.min(activeShoes.length - 1, i + 1));

  const handleTouchStart = (e) => setSwipeStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (swipeStart === null) return;
    const diff = swipeStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    setSwipeStart(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 20% 0%, #0f3460 0%, #0a0a0f 50%, #0f0a1e 100%)", fontFamily: "'Barlow Condensed', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "28px 24px 0", maxWidth: 460, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", letterSpacing: 5, marginBottom: 4 }}>MILEAGE TRACKER</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: "white", letterSpacing: -0.5, lineHeight: 1 }}>
              SOLE<span style={{ color: "#FF6B35" }}>LOG</span>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} style={{
            background: "linear-gradient(135deg, #FF6B35, #ff8c5a)",
            border: "none", borderRadius: 14, color: "white",
            padding: "10px 18px", cursor: "pointer", fontWeight: 800,
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, letterSpacing: 2,
            boxShadow: "0 4px 20px rgba(255,107,53,0.35)"
          }}>+ ADD</button>
        </div>

        <div style={{ display: "flex", marginTop: 24, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 4 }}>
          {["active","archived"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "8px 0", borderRadius: 9, border: "none",
              background: tab === t ? "rgba(255,255,255,0.1)" : "transparent",
              color: tab === t ? "white" : "rgba(255,255,255,0.28)",
              cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 14, letterSpacing: 2, fontWeight: tab === t ? 700 : 400,
              transition: "all 0.2s"
            }}>
              {t.toUpperCase()} ({t === "active" ? activeShoes.length : archivedShoes.length})
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 0 40px", maxWidth: 460, margin: "0 auto" }}>
        {tab === "active" ? (
          activeShoes.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 60, color: "rgba(255,255,255,0.22)", letterSpacing: 2 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👟</div>
              <div>NO ACTIVE SHOES</div>
              <div style={{ fontSize: 13, marginTop: 8, letterSpacing: 1 }}>Tap + ADD to get started</div>
            </div>
          ) : (
            <div>
              {activeShoes.length > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
                  {activeShoes.map((s, i) => (
                    <div key={s.id} onClick={() => setCurrentIdx(i)} style={{
                      width: i === safeIdx ? 22 : 7, height: 7, borderRadius: 4,
                      background: i === safeIdx ? activeShoes[safeIdx].color : "rgba(255,255,255,0.15)",
                      cursor: "pointer", transition: "all 0.3s"
                    }} />
                  ))}
                </div>
              )}

              <div style={{ padding: "0 20px", position: "relative" }}
                onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                {safeIdx > 0 && (
                  <button onClick={prev} style={{
                    position: "absolute", left: -4, top: "50%", transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "50%", width: 36, height: 36, cursor: "pointer",
                    color: "white", fontSize: 16, zIndex: 2,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>‹</button>
                )}
                {safeIdx < activeShoes.length - 1 && (
                  <button onClick={next} style={{
                    position: "absolute", right: -4, top: "50%", transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "50%", width: 36, height: 36, cursor: "pointer",
                    color: "white", fontSize: 16, zIndex: 2,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>›</button>
                )}
                <ShoeCard
                  shoe={activeShoes[safeIdx]}
                  onUpdate={updateShoe}
                  onArchive={archiveShoe}
                  onDelete={deleteShoe}
                />
              </div>

              <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.18)", letterSpacing: 2 }}>
                {safeIdx + 1} / {activeShoes.length}
              </div>
            </div>
          )
        ) : (
          <ArchivedList shoes={archivedShoes} onRestore={restoreShoe} onDelete={deleteShoe} />
        )}
      </div>

      {showAdd && <AddShoeModal onAdd={addShoe} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
