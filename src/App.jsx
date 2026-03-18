import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════════════════════

const DB = {
  async get(k) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch { return null; } },
  async set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) { console.error(e); } },
  async del(k) { try { localStorage.removeItem(k); } catch { } },
};

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT SYLLABUS (Degree Level Prelims 2025)
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_SYLLABUS = {
  id: "dlp2025",
  name: "Degree Level Common Preliminary Examination 2025",
  shortName: "DLP 2025",
  totalMarks: 100,
  negMark: 0.333,
  createdAt: Date.now(),
  subjects: [
    { id: "hist", name: "History", maxMarks: 10, topics: [
      "Kerala – Europeans & Travancore History",
      "Kerala – Social & Religious Reform Movements",
      "Kerala – National Movement & Literary Sources",
      "Kerala – United Kerala Movement & Post-1956",
      "India – Medieval India & British Establishment",
      "India – First War of Independence & INC Formation",
      "India – Swadeshi & Social Reform Movements",
      "India – Gandhi, Freedom Struggle & Independence",
      "India – Post-Independence & State Reorganisation",
      "World – Great Revolutions (England, America, France)",
      "World – Russian & Chinese Revolutions",
      "World – Post-WWII Political History & UNO",
      "Current Affairs (History)",
    ]},
    { id: "geo", name: "Geography", maxMarks: 5, topics: [
      "Basics – Earth Structure, Atmosphere & Rocks",
      "Basics – Landforms, Pressure Belts & Winds",
      "Basics – Climate, Seasons & Global Issues",
      "Basics – Maps, Remote Sensing & GIS",
      "Basics – Oceans, Continents & World Nations",
      "India – Physiography & Northern Mountains",
      "India – Rivers & Great Plains",
      "India – Peninsular Plateau & Coastal Plains",
      "India – Climate, Vegetation & Agriculture",
      "India – Minerals, Industries & Transport",
      "Kerala – Physiography, Districts & Rivers",
      "Kerala – Climate, Vegetation & Wildlife",
      "Kerala – Agriculture, Minerals & Transport",
      "Current Affairs (Geography)",
    ]},
    { id: "eco", name: "Economics", maxMarks: 5, topics: [
      "National Income & Per Capita Income",
      "Factors of Production & Economic Sectors",
      "Indian Economic Planning & Five Year Plans",
      "NITI Aayog",
      "Types & Functions of Economic Institutions",
      "Reserve Bank of India & Functions",
      "Public Revenue – Tax & Non-Tax",
      "Public Expenditure & Budget",
      "Fiscal Policy",
      "Consumer Protection & Rights",
      "Current Affairs (Economics)",
    ]},
    { id: "civ", name: "Civics", maxMarks: 5, topics: [
      "Public Administration & Bureaucracy",
      "Indian Civil Service & State Civil Service",
      "E-Governance & Information Commission (RTI)",
      "Lokpal & Lokayuktha",
      "Government – Executive, Judiciary, Legislature",
      "Elections & Political Parties",
      "Human Rights & Human Rights Organisations",
      "Consumer Protection, Labour & Employment Acts",
      "Land Reforms & Social Welfare",
      "National Rural Employment Policies",
      "Socio-Economic Statistical Data",
      "Current Affairs (Civics)",
    ]},
    { id: "const", name: "Indian Constitution", maxMarks: 5, topics: [
      "Constituent Assembly & Preamble",
      "Fundamental Rights",
      "Directive Principles of State Policy (DPSP)",
      "Fundamental Duties",
      "Citizenship",
      "Constitutional Amendments",
      "Panchayati Raj",
      "Constitutional Institutions & Functions",
      "Emergency Provisions",
      "Union List, State List & Concurrent List",
      "Current Affairs (Constitution)",
    ]},
    { id: "arts", name: "Arts, Literature, Culture & Sports", maxMarks: 10, topics: [
      "Kerala Visual & Performing Arts – Origin & Famous Persons",
      "Kerala Arts – Famous Institutions & Places",
      "Sports – Kerala & Indian Personalities & Achievements",
      "Sports – Major Awards & Trophies",
      "Sports – Olympic Games (India's Performance)",
      "Sports – Asian, Afro-Asian, Commonwealth & SAF Games",
      "Sports – National Games & Game Terminology",
      "Malayalam Literature – Major Movements & First Works",
      "Malayalam Literature – Authors, Pen Names & Works",
      "Malayalam Literature – Awards & Jnanpith Winners",
      "Malayalam Cinema – Origin, Milestones & National Awards",
      "Kerala Festivals & Cultural Centres",
      "Indian Arts & National Culture",
      "Current Affairs (Arts/Sports/Literature)",
    ]},
    { id: "comp", name: "Basics of Computer", maxMarks: 5, topics: [
      "Hardware – Input & Output Devices",
      "Hardware – Memory (Primary & Secondary)",
      "Software – Classification (System & Application)",
      "Software – Operating System Functions",
      "Software – Application Packages (Word, Excel, DB, PPT)",
      "Software – Basics of Programming",
      "Networks – LAN, WAN, MAN",
      "Networks – Devices (Switch, Hub, Router, etc.)",
      "Internet – WWW, E-mail & Search Engines",
      "Internet – Social Media & Web Designing (HTML)",
      "Cyber Crimes & IT Act 2000",
      "Current Affairs (Computer)",
    ]},
    { id: "sci", name: "Science & Technology", maxMarks: 5, topics: [
      "Nature & Scope of S&T, National Policy",
      "Basics of Everyday Science",
      "Human Body, Public Health & Nutrition",
      "Indian Scientists & S&T Institutions",
      "Space Programme – ISRO & Satellite Programmes",
      "Defence – DRDO Vision & Activities",
      "Energy – Needs, Resources & Renewable Energy",
      "Nuclear & Energy Policy of India",
      "Environment – Issues, Laws & Treaties",
      "Biodiversity, Climate Change & Western Ghats",
      "Forest, Wildlife & Environmental Hazards",
      "Biotechnology, Green Tech & Nanotechnology",
      "Current Affairs (Science & Technology)",
    ]},
    { id: "arith", name: "Simple Arithmetic", maxMarks: 10, topics: [
      "Numbers & Basic Operations",
      "Fractions & Decimal Numbers",
      "Percentage",
      "Profit and Loss",
      "Simple & Compound Interest",
      "Ratio and Proportion",
      "Time and Distance",
      "Time and Work",
      "Average",
      "Laws of Exponents",
      "Mensuration (Perimeter, Area, Volume)",
      "Progressions (AP & GP)",
    ]},
    { id: "mental", name: "Mental Ability & Reasoning", maxMarks: 10, topics: [
      "Number & Letter Series",
      "Problems on Mathematical Signs",
      "Position / Ranking",
      "Analogy (Word, Alphabet, Number)",
      "Odd Man Out",
      "Number Observation Problems",
      "Coding and Decoding",
      "Family Relations / Blood Relations",
      "Sense of Direction",
      "Clock – Time & Angles",
      "Clock – Reflection",
      "Calendar & Date Problems",
      "Clerical Ability",
    ]},
    { id: "gram", name: "English Grammar", maxMarks: 10, topics: [
      "Types of Sentences & Interchange",
      "Parts of Speech",
      "Subject-Verb Agreement",
      "Articles (Definite & Indefinite)",
      "Primary & Modal Auxiliary Verbs",
      "Question Tags",
      "Infinitive & Gerunds",
      "Tenses",
      "Conditional Sentences",
      "Prepositions",
      "Correlatives",
      "Direct & Indirect Speech",
      "Active & Passive Voice",
      "Correction of Sentences",
      "Degrees of Comparison",
    ]},
    { id: "vocab", name: "Vocabulary", maxMarks: 10, topics: [
      "Singular & Plural, Gender, Collective Nouns",
      "Word Formation (Prefix & Suffix)",
      "Compound Words",
      "Synonyms",
      "Antonyms",
      "Phrasal Verbs",
      "Foreign Words & Phrases",
      "One Word Substitutes",
      "Words Often Confused",
      "Spelling Test",
      "Idioms & Their Meanings",
      "Common Abbreviations",
    ]},
    { id: "mal", name: "Malayalam", maxMarks: 10, topics: [
      "പദശുദ്ധി (Word Purity / Correct Word)",
      "വാക്യശുദ്ധി (Correct Sentence)",
      "പരിഭാഷ (Translation)",
      "ഒറ്റപ്പദം (One Word Substitution)",
      "പര്യായം (Synonyms)",
      "വിപരീത പദം (Antonyms)",
      "ശൈലികൾ / പഴഞ്ചൊൽ (Idioms & Proverbs)",
      "ചേർത്തെഴുതൽ / സന്ധി (Join the Word / Sandhi)",
      "സ്ത്രീലിംഗം / പുല്ലിംഗം (Gender)",
      "വചനം (Number – Singular & Plural)",
      "പിരിച്ചെഴുതൽ (Word Splitting)",
      "ഘടക പദം (Component Word / Phrase Joining)",
    ]},
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

const uid = () => Math.random().toString(36).slice(2, 10);

function calcMarks(correct, wrong, negMark = 1/3) {
  const c = parseInt(correct) || 0;
  const w = parseInt(wrong) || 0;
  return { correct: c, wrong: w, marks: Math.max(0, c - w * negMark) };
}

function calcGuess(g5050c, g5050w, gwildc, gwildw, negMark = 1/3) {
  const r1 = calcMarks(g5050c, g5050w, negMark);
  const r2 = calcMarks(gwildc, gwildw, negMark);
  return {
    fiftyFifty: r1,
    wildGuess: r2,
    totalGuessMarks: r1.marks + r2.marks,
    totalGuessCorrect: r1.correct + r2.correct,
    totalGuessWrong: r1.wrong + r2.wrong,
  };
}

const pct = (v, max) => max > 0 ? Math.round((v / max) * 100) : 0;
const scoreColor = (p) => p >= 70 ? "#4ade80" : p >= 50 ? "#fbbf24" : p >= 35 ? "#fb923c" : "#f87171";
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

const T = {
  bg:       "#07090f",
  surface:  "#0d1117",
  card:     "#111827",
  border:   "#1f2937",
  border2:  "#374151",
  text:     "#f9fafb",
  text2:    "#9ca3af",
  text3:    "#4b5563",
  accent:   "#6366f1",
  accent2:  "#818cf8",
  green:    "#4ade80",
  yellow:   "#fbbf24",
  orange:   "#fb923c",
  red:      "#f87171",
  pink:     "#f472b6",
  cyan:     "#22d3ee",
  purple:   "#a78bfa",
};

const inp = {
  background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6,
  padding: "8px 10px", color: T.text, fontSize: 13, outline: "none",
  width: "100%", boxSizing: "border-box", fontFamily: "inherit",
  transition: "border-color 0.15s",
};
const btn = (bg = T.accent, col = "#fff") => ({
  background: bg, border: "none", borderRadius: 6, padding: "9px 18px",
  color: col, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  transition: "opacity 0.15s",
});
const btnGhost = {
  background: "transparent", border: `1px solid ${T.border2}`, borderRadius: 6,
  padding: "7px 14px", color: T.text2, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
};
const card = {
  background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "18px 20px",
};

// ═══════════════════════════════════════════════════════════════════════════════
// MINI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function Bar({ value, max, height = 6 }) {
  const p = clamp(pct(value, max), 0, 100);
  const col = scoreColor(p);
  return (
    <div style={{ background: T.border, borderRadius: 99, height, overflow: "hidden" }}>
      <div style={{ width: `${p}%`, height: "100%", background: col, borderRadius: 99, transition: "width 0.5s ease" }} />
    </div>
  );
}

function Badge({ label, color = T.accent }) {
  return <span style={{ background: color + "22", color, fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 600, letterSpacing: "0.04em" }}>{label}</span>;
}

function NumInput({ value, onChange, min = 0, max, label, small }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <span style={{ fontSize: 10, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>}
      <input type="number" min={min} max={max} value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...inp, width: small ? 68 : "100%", textAlign: "center", fontFamily: "monospace", fontSize: 14 }} />
    </label>
  );
}

function Section({ title, children, accent = T.accent, action }) {
  return (
    <div style={{ ...card, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, borderBottom: `1px solid ${T.border}`, paddingBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: "0.03em", borderLeft: `3px solid ${accent}`, paddingLeft: 8 }}>{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: T.card, border: `1px solid ${T.border2}`, borderRadius: 12, padding: 24, width: "100%", maxWidth: wide ? 900 : 560, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontWeight: 700, color: T.text, fontSize: 16 }}>{title}</span>
          <button onClick={onClose} style={{ ...btnGhost, padding: "4px 10px" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OMR SHEET (100 questions, 4 options each)
// ═══════════════════════════════════════════════════════════════════════════════

function OMRSheet({ answers, onChange, onClose }) {
  const [local, setLocal] = useState(answers || {});
  const opts = ["A", "B", "C", "D"];

  const toggle = (q, o) => {
    setLocal(prev => ({ ...prev, [q]: prev[q] === o ? null : o }));
  };

  const answered = Object.values(local).filter(Boolean).length;

  return (
    <Modal title={`OMR Answer Sheet (${answered}/100 filled)`} onClose={onClose} wide>
      <div style={{ marginBottom: 12, fontSize: 12, color: T.text2 }}>
        Click a bubble to select, click again to deselect. Save when done.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
        {Array.from({ length: 100 }, (_, i) => i + 1).map(q => (
          <div key={q} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 6px", borderRadius: 4, background: local[q] ? T.accent + "11" : "transparent" }}>
            <span style={{ fontSize: 11, color: T.text3, width: 22, textAlign: "right", fontFamily: "monospace" }}>{q}.</span>
            {opts.map(o => (
              <button key={o} onClick={() => toggle(q, o)}
                style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${local[q] === o ? T.accent : T.border2}`, background: local[q] === o ? T.accent : "transparent", color: local[q] === o ? "#fff" : T.text2, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.1s" }}>
                {o}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={btnGhost}>Cancel</button>
        <button onClick={() => { onChange(local); onClose(); }} style={btn(T.accent)}>Save OMR Answers</button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYLLABUS EDITOR
// ═══════════════════════════════════════════════════════════════════════════════

function SyllabusEditor({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || "");
  const [shortName, setShortName] = useState(initial?.shortName || "");
  const [negMark, setNegMark] = useState(initial?.negMark ?? 0.333);
  const [subjects, setSubjects] = useState(
    initial?.subjects ? initial.subjects.map(s => ({ ...s, topicsText: s.topics.join("\n") })) : []
  );

  const addSubject = () => setSubjects(prev => [...prev, { id: uid(), name: "", maxMarks: 10, topicsText: "" }]);
  const updSubj = (idx, key, val) => setSubjects(prev => prev.map((s, i) => i === idx ? { ...s, [key]: val } : s));
  const delSubj = (idx) => setSubjects(prev => prev.filter((_, i) => i !== idx));

  const totalMarks = subjects.reduce((a, s) => a + (parseInt(s.maxMarks) || 0), 0);

  const save = () => {
    if (!name.trim()) return alert("Enter a syllabus name.");
    const subs = subjects.map(s => ({
      ...s,
      maxMarks: parseInt(s.maxMarks) || 0,
      topics: s.topicsText.split("\n").map(t => t.trim()).filter(Boolean),
    }));
    onSave({ id: initial?.id || uid(), name: name.trim(), shortName: shortName.trim() || name.trim(), negMark: parseFloat(negMark) || 1/3, totalMarks, createdAt: initial?.createdAt || Date.now(), subjects: subs });
  };

  return (
    <Modal title={initial ? "Edit Syllabus" : "New Syllabus"} onClose={onClose} wide>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: "span 2" }}>
          <span style={{ fontSize: 11, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em" }}>Exam Name</span>
          <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Degree Level Preliminary 2025" />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <span style={{ fontSize: 11, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em" }}>Short Name</span>
          <input style={inp} value={shortName} onChange={e => setShortName(e.target.value)} placeholder="DLP 2025" />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <span style={{ fontSize: 11, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em" }}>Negative Mark / Wrong</span>
          <input style={inp} type="number" step="0.01" min="0" max="1" value={negMark} onChange={e => setNegMark(e.target.value)} />
        </label>
        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
          <span style={{ fontSize: 13, color: T.text2 }}>Total Marks: <strong style={{ color: totalMarks === 100 ? T.green : T.yellow }}>{totalMarks}</strong></span>
        </div>
      </div>

      <div style={{ marginBottom: 12, fontWeight: 700, fontSize: 13, color: T.text }}>Subjects & Topics</div>
      {subjects.map((s, idx) => (
        <div key={s.id} style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: 14, marginBottom: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px auto", gap: 10, marginBottom: 10 }}>
            <input style={inp} value={s.name} onChange={e => updSubj(idx, "name", e.target.value)} placeholder="Subject name" />
            <input style={inp} type="number" value={s.maxMarks} onChange={e => updSubj(idx, "maxMarks", e.target.value)} placeholder="Marks" />
            <button onClick={() => delSubj(idx)} style={{ ...btnGhost, color: T.red, borderColor: T.red + "44" }}>Remove</button>
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ fontSize: 10, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em" }}>Topics (one per line)</span>
            <textarea value={s.topicsText} onChange={e => updSubj(idx, "
