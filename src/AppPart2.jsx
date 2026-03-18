import { useState, useEffect } from "react";
import { DB, uid, calcMarks, calcGuess, pct, scoreColor, clamp, T,
         inp, btn, btnGhost, card, DEFAULT_SYLLABUS,
         Bar, Badge, NumInput, Section, Modal,
         OMRSheet, SyllabusEditor, emptyPaperFor, PaperForm } from "./AppPart1";

function PaperDetail({ paper, syllabus, onEdit, onClose }) {
  const [pdfOpen, setPdfOpen] = useState(false);
  const neg = syllabus.negMark;

  const subjCalcs = syllabus.subjects.map(s => {
    const d = paper.subjects[s.id] || {};
    return { ...s, ...calcMarks(d.correct, d.wrong, neg) };
  });
  const totalCorrect = subjCalcs.reduce((a, s) => a + s.correct, 0);
  const totalWrong = subjCalcs.reduce((a, s) => a + s.wrong, 0);
  const totalMarks = subjCalcs.reduce((a, s) => a + s.marks, 0);
  const g = paper.guesses || {};
  const guessCalc = calcGuess(g.ff_correct, g.ff_wrong, g.wg_correct, g.wg_wrong, neg);
  const omrAnswered = Object.values(paper.omr || {}).filter(Boolean).length;

  return (
    <Modal title={paper.name || "Paper Detail"} onClose={onClose} wide>
      {/* Header strip */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, padding: "12px 16px", background: T.surface, borderRadius: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 30, fontWeight: 900, fontFamily: "monospace", color: scoreColor(pct(totalMarks, 100)) }}>{totalMarks.toFixed(2)}<span style={{ fontSize: 14, color: T.text3 }}>/100</span></span>
        {paper.code && <Badge label={paper.code} color={T.accent} />}
        {paper.date && <span style={{ fontSize: 12, color: T.text3 }}>{paper.date}</span>}
        <span style={{ marginLeft: "auto", fontSize: 12, color: T.text2 }}>✓ {totalCorrect} &nbsp; ✗ {totalWrong} &nbsp; Penalty: {(totalWrong * neg).toFixed(2)}</span>
        <button onClick={onEdit} style={btnGhost}>Edit</button>
      </div>

      {/* Subject breakdown */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: T.text, fontSize: 13, marginBottom: 10 }}>Subject-wise Scores</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>{["Subject", "Max", "Correct", "Wrong", "Penalty", "Marks", "%"].map(h => (
              <th key={h} style={{ textAlign: h === "Subject" ? "left" : "center", padding: "6px 8px", color: T.text3, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${T.border}` }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {subjCalcs.map(s => {
              const p = pct(s.marks, s.maxMarks);
              return (
                <tr key={s.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: "8px 8px", color: T.text }}>{s.name}</td>
                  <td style={{ padding: "8px 8px", textAlign: "center", color: T.text3, fontFamily: "monospace" }}>{s.maxMarks}</td>
                  <td style={{ padding: "8px 8px", textAlign: "center", color: T.green, fontFamily: "monospace" }}>{s.correct}</td>
                  <td style={{ padding: "8px 8px", textAlign: "center", color: T.red, fontFamily: "monospace" }}>{s.wrong}</td>
                  <td style={{ padding: "8px 8px", textAlign: "center", color: T.orange, fontFamily: "monospace" }}>-{(s.wrong * neg).toFixed(2)}</td>
                  <td style={{ padding: "8px 8px", textAlign: "center", fontFamily: "monospace", color: scoreColor(p), fontWeight: 700 }}>{s.marks.toFixed(2)}</td>
                  <td style={{ padding: "8px 8px", textAlign: "center" }}><Badge label={`${p}%`} color={scoreColor(p)} /></td>
                </tr>
              );
            })}
            <tr style={{ background: T.surface }}>
              <td style={{ padding: "8px 8px", fontWeight: 700, color: T.text }}>TOTAL</td>
              <td style={{ padding: "8px 8px", textAlign: "center", color: T.text3, fontFamily: "monospace" }}>100</td>
              <td style={{ padding: "8px 8px", textAlign: "center", color: T.green, fontFamily: "monospace", fontWeight: 700 }}>{totalCorrect}</td>
              <td style={{ padding: "8px 8px", textAlign: "center", color: T.red, fontFamily: "monospace", fontWeight: 700 }}>{totalWrong}</td>
              <td style={{ padding: "8px 8px", textAlign: "center", color: T.orange, fontFamily: "monospace", fontWeight: 700 }}>-{(totalWrong * neg).toFixed(2)}</td>
              <td style={{ padding: "8px 8px", textAlign: "center", fontFamily: "monospace", fontWeight: 900, fontSize: 15, color: scoreColor(pct(totalMarks, 100)) }}>{totalMarks.toFixed(2)}</td>
              <td style={{ padding: "8px 8px", textAlign: "center" }}><Badge label={`${pct(totalMarks, 100)}%`} color={scoreColor(pct(totalMarks, 100))} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Guess breakdown */}
      {(g.ff_correct || g.ff_wrong || g.wg_correct || g.wg_wrong) && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: T.text, fontSize: 13, marginBottom: 10 }}>Guesswork Breakdown</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "50:50 Guesses", c: guessCalc.fiftyFifty.correct, w: guessCalc.fiftyFifty.wrong, net: guessCalc.fiftyFifty.marks, col: T.cyan },
              { label: "Wild / Weak Memory", c: guessCalc.wildGuess.correct, w: guessCalc.wildGuess.wrong, net: guessCalc.wildGuess.marks, col: T.orange },
            ].map(row => (
              <div key={row.label} style={{ border: `1px solid ${row.col}33`, borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ color: row.col, fontWeight: 700, fontSize: 12, marginBottom: 6 }}>{row.label}</div>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: T.text2 }}>
                  <span>✓ {row.c}</span><span>✗ {row.w}</span>
                  <span>Net: <strong style={{ color: row.net >= 0 ? T.green : T.red, fontFamily: "monospace" }}>{row.net.toFixed(2)}</strong></span>
                  <span>Acc: <strong style={{ color: row.col }}>{row.c + row.w > 0 ? Math.round(row.c / (row.c + row.w) * 100) : "—"}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic freq */}
      {paper.topicFreq && Object.values(paper.topicFreq).some(s => Object.values(s).some(v => v > 0)) && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: T.text, fontSize: 13, marginBottom: 10 }}>Topic Frequency in This Paper</div>
          {syllabus.subjects.map(s => {
            const tf = paper.topicFreq[s.id] || {};
            const entries = s.topics.map(t => ({ t, v: parseInt(tf[t]) || 0 })).filter(e => e.v > 0);
            if (!entries.length) return null;
            return (
              <div key={s.id} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: T.accent2, fontWeight: 600, marginBottom: 6 }}>{s.name}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {entries.map(e => <Badge key={e.t} label={`${e.t}: ${e.v}Q`} color={T.purple} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OMR summary */}
      {omrAnswered > 0 && (
        <div style={{ marginBottom: 20, padding: "10px 14px", border: `1px solid ${T.border}`, borderRadius: 8 }}>
          <span style={{ fontSize: 12, color: T.text2 }}>OMR: {omrAnswered}/100 recorded &nbsp;|&nbsp; </span>
          {["A","B","C","D"].map(o => <span key={o} style={{ fontSize: 12, color: T.text2, marginRight: 12 }}><span style={{ color: T.accent }}>{o}</span>: {Object.values(paper.omr).filter(v => v === o).length}</span>)}
        </div>
      )}

      {/* Notes */}
      {paper.notes && (
        <div style={{ padding: "10px 14px", background: T.surface, borderRadius: 8, fontSize: 12, color: T.text2, marginBottom: 16, lineHeight: 1.7 }}>
          📝 {paper.notes}
        </div>
      )}

      {/* PDF viewer */}
      {paper.pdfData && (
        <div>
          <button onClick={() => setPdfOpen(!pdfOpen)} style={btn(T.surface)}>
            {pdfOpen ? "▲ Hide PDF" : `📄 View Question Paper — ${paper.pdfName}`}
          </button>
          {pdfOpen && (
            <iframe src={paper.pdfData} style={{ width: "100%", height: 500, marginTop: 12, borderRadius: 8, border: `1px solid ${T.border}` }} title="Question Paper PDF" />
          )}
        </div>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

function Analytics({ papers, syllabus }) {
  if (!papers.length) return (
    <div style={{ textAlign: "center", padding: 60, color: T.text3 }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
      Add papers to see analytics
    </div>
  );

  const neg = syllabus.negMark;

  const paperCalcs = papers.map(p => {
    const subj = syllabus.subjects.map(s => {
      const d = p.subjects?.[s.id] || {};
      return { id: s.id, name: s.name, max: s.maxMarks, ...calcMarks(d.correct, d.wrong, neg) };
    });
    const totalMarks = subj.reduce((a, s) => a + s.marks, 0);
    const totalCorrect = subj.reduce((a, s) => a + s.correct, 0);
    const totalWrong = subj.reduce((a, s) => a + s.wrong, 0);
    const g = p.guesses || {};
    const gc = calcGuess(g.ff_correct, g.ff_wrong, g.wg_correct, g.wg_wrong, neg);
    return { paper: p, subj, totalMarks, totalCorrect, totalWrong, gc };
  });

  // Subject averages
  const subjAvg = syllabus.subjects.map(s => {
    const vals = paperCalcs.map(pc => { const sj = pc.subj.find(x => x.id === s.id); return sj ? sj.marks : 0; });
    const avgMarks = vals.reduce((a, b) => a + b, 0) / vals.length;
    const avgPct = pct(avgMarks, s.maxMarks);
    return { ...s, avgMarks, avgPct, vals };
  });

  // Topic frequency aggregation
  const topicTotals = {};
  syllabus.subjects.forEach(s => {
    topicTotals[s.id] = {};
    s.topics.forEach(t => {
      topicTotals[s.id][t] = papers.reduce((a, p) => a + (parseInt(p.topicFreq?.[s.id]?.[t]) || 0), 0);
    });
  });

  // Score trend
  const trend = paperCalcs.map(pc => ({ name: pc.paper.name || pc.paper.code || "—", score: pc.totalMarks }));

  // Guess strategy analysis
  const ffData = paperCalcs.filter(pc => (parseInt(pc.paper.guesses?.ff_correct) || 0) + (parseInt(pc.paper.guesses?.ff_wrong) || 0) > 0);
  const wgData = paperCalcs.filter(pc => (parseInt(pc.paper.guesses?.wg_correct) || 0) + (parseInt(pc.paper.guesses?.wg_wrong) || 0) > 0);
  const ffAvgAcc = ffData.length ? ffData.reduce((a, pc) => { const t = pc.gc.fiftyFifty; return a + (t.correct + t.wrong > 0 ? t.correct / (t.correct + t.wrong) * 100 : 0); }, 0) / ffData.length : null;
  const wgAvgAcc = wgData.length ? wgData.reduce((a, pc) => { const t = pc.gc.wildGuess; return a + (t.correct + t.wrong > 0 ? t.correct / (t.correct + t.wrong) * 100 : 0); }, 0) / wgData.length : null;

  // Attempt rate
  const avgAttempted = paperCalcs.reduce((a, pc) => a + pc.totalCorrect + pc.totalWrong, 0) / paperCalcs.length;
  const avgUnattempted = 100 - avgAttempted;

  // Weakest 3 subjects
  const weakest = [...subjAvg].sort((a, b) => a.avgPct - b.avgPct).slice(0, 3);
  const strongest = [...subjAvg].sort((a, b) => b.avgPct - a.avgPct).slice(0, 3);

  const maxScore = Math.max(...trend.map(t => t.score), 1);
  const minScore = Math.min(...trend.map(t => t.score));

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { l: "Papers Tracked", v: papers.length, c: T.accent },
          { l: "Average Score", v: (paperCalcs.reduce((a, p) => a + p.totalMarks, 0) / paperCalcs.length).toFixed(1) + "/100", c: scoreColor(pct(paperCalcs.reduce((a, p) => a + p.totalMarks, 0) / paperCalcs.length, 100)) },
          { l: "Best Score", v: Math.max(...paperCalcs.map(p => p.totalMarks)).toFixed(1), c: T.green },
          { l: "Avg Attempted", v: Math.round(avgAttempted) + "/100", c: T.cyan },
        ].map(k => (
          <div key={k.l} style={{ ...card, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{k.l}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.c, fontFamily: "monospace" }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Score Trend */}
      <Section title="Score Trend Across Papers" accent={T.accent}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 90 }}>
          {trend.map((t, i) => {
            const h = ((t.score - minScore) / (maxScore - minScore || 1)) * 70 + 10;
            const col = scoreColor(pct(t.score, 100));
            return (
              <div key={i} title={`${t.name}: ${t.score.toFixed(1)}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 9, color: col, fontFamily: "monospace" }}>{t.score.toFixed(1)}</span>
                <div style={{ width: "100%", height: `${h}px`, background: col + "55", borderRadius: "3px 3px 0 0", border: `1px solid ${col}`, cursor: "default", transition: "all 0.3s" }} />
                <span style={{ fontSize: 8, color: T.text3, maxWidth: 40, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>{t.name}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 20, fontSize: 11, color: T.text3 }}>
          <span>Δ Improvement: <strong style={{ color: trend.length > 1 ? (trend[trend.length - 1].score > trend[0].score ? T.green : T.red) : T.text3 }}>
            {trend.length > 1 ? (trend[trend.length - 1].score - trend[0].score).toFixed(1) : "—"}
          </strong></span>
          <span>Std Dev: <strong style={{ color: T.text2 }}>
            {trend.length > 1 ? (() => { const m = trend.reduce((a, t) => a + t.score, 0) / trend.length; return Math.sqrt(trend.reduce((a, t) => a + (t.score - m) ** 2, 0) / trend.length).toFixed(1); })() : "—"}
          </strong></span>
        </div>
      </Section>

      {/* Subject performance */}
      <Section title="Subject-wise Average Performance" accent={T.purple}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...subjAvg].sort((a, b) => a.avgPct - b.avgPct).map(s => (
            <div key={s.id} style={{ display: "grid", gridTemplateColumns: "170px 1fr 70px 60px", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: s.avgPct < 40 ? T.red : T.text2 }}>{s.name}</span>
              <Bar value={s.avgMarks} max={s.maxMarks} height={8} />
              <span style={{ fontFamily: "monospace", fontSize: 11, color: T.text3 }}>{s.avgMarks.toFixed(1)}/{s.maxMarks}</span>
              <Badge label={`${s.avgPct}%`} color={scoreColor(s.avgPct)} />
            </div>
          ))}
        </div>
      </Section>

      {/* Weak / Strong */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Section title="🔴 Weakest Subjects" accent={T.red}>
          {weakest.map((s, i) => (
            <div key={s.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: T.text }}>#{i + 1} {s.name}</span>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: T.red }}>{s.avgPct}%</span>
              </div>
              <Bar value={s.avgMarks} max={s.maxMarks} />
            </div>
          ))}
        </Section>
        <Section title="🟢 Strongest Subjects" accent={T.green}>
          {strongest.map((s, i) => (
            <div key={s.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: T.text }}>#{i + 1} {s.name}</span>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: T.green }}>{s.avgPct}%</span>
              </div>
              <Bar value={s.avgMarks} max={s.maxMarks} />
            </div>
          ))}
        </Section>
      </div>

      {/* Guess analysis */}
      <Section title="🎲 Guesswork Strategy Analysis" accent={T.yellow}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div style={{ border: `1px solid ${T.cyan}44`, borderRadius: 8, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: T.cyan, marginBottom: 8, fontWeight: 600 }}>50:50 Average Accuracy</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: T.cyan, fontFamily: "monospace" }}>{ffAvgAcc !== null ? Math.round(ffAvgAcc) + "%" : "—"}</div>
            <div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>Expected: 50% | Break-even at ~{Math.round(1 / (1 + neg) * 100)}%</div>
          </div>
          <div style={{ border: `1px solid ${T.orange}44`, borderRadius: 8, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: T.orange, marginBottom: 8, fontWeight: 600 }}>Wild Guess Average Accuracy</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: T.orange, fontFamily: "monospace" }}>{wgAvgAcc !== null ? Math.round(wgAvgAcc) + "%" : "—"}</div>
            <div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>Expected: 25% | Break-even at ~{Math.round(1 / (1 + neg) * 100)}%</div>
          </div>
          <div style={{ border: `1px solid ${T.yellow}44`, borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 11, color: T.yellow, marginBottom: 10, fontWeight: 600 }}>Strategy Verdict</div>
            {ffAvgAcc !== null && <div style={{ fontSize: 11, color: T.text2, marginBottom: 6 }}>50:50: <span style={{ color: ffAvgAcc >= (1 / (1 + neg) * 100) ? T.green : T.red, fontWeight: 600 }}>{ffAvgAcc >= (1 / (1 + neg) * 100) ? "✓ Profitable" : "✗ Losing marks"}</span></div>}
            {wgAvgAcc !== null && <div style={{ fontSize: 11, color: T.text2, marginBottom: 6 }}>Wild Guess: <span style={{ color: wgAvgAcc >= (1 / (1 + neg) * 100) ? T.green : T.red, fontWeight: 600 }}>{wgAvgAcc >= (1 / (1 + neg) * 100) ? "✓ Profitable" : "✗ Losing marks"}</span></div>}
            <div style={{ fontSize: 10, color: T.text3, marginTop: 8 }}>Break-even: answer right on ≥{Math.round(1 / (1 + neg) * 100)}% of guesses</div>
          </div>
        </div>
      </Section>

      {/* Topic frequency heatmap */}
      <Section title="📌 Topic Frequency Heatmap (All Papers Combined)" accent={T.cyan}>
        <div style={{ fontSize: 11, color: T.text3, marginBottom: 14 }}>
          Total questions from each topic across all {papers.length} paper(s). Higher = more frequently tested.
        </div>
        {syllabus.subjects.map(s => {
          const tf = topicTotals[s.id];
          const maxFreq = Math.max(...Object.values(tf), 1);
          const entries = s.topics.map(t => ({ t, v: tf[t] || 0 })).sort((a, b) => b.v - a.v);
          const hasData = entries.some(e => e.v > 0);
          return (
            <div key={s.id} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.accent2, marginBottom: 6 }}>{s.name}</div>
              {!hasData ? <span style={{ fontSize: 11, color: T.text3 }}>No frequency data yet for this subject</span> : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {entries.map(e => {
                    const intensity = e.v / maxFreq;
                    const bg = `rgba(99,102,241,${0.1 + intensity * 0.7})`;
                    return (
                      <span key={e.t} style={{ background: bg, border: `1px solid rgba(99,102,241,${0.2 + intensity * 0.5})`, borderRadius: 4, padding: "3px 8px", fontSize: 10, color: e.v > 0 ? T.text : T.text3 }}>
                        {e.t} {e.v > 0 && <strong>({e.v})</strong>}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </Section>

      {/* Attempt rate analysis */}
      <Section title="📋 Attempt Rate & Risk Analysis" accent={T.pink}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {paperCalcs.map((pc, i) => {
            const attempted = pc.totalCorrect + pc.totalWrong;
            const unattempted = 100 - attempted;
            const safeScore = pc.totalCorrect - pc.totalWrong * neg;
            const lostToWrong = (pc.totalWrong * neg).toFixed(1);
            return (
              <div key={i} style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.text, marginBottom: 6 }}>{pc.paper.name || `Paper ${i + 1}`}</div>
                <div style={{ fontSize: 10, color: T.text3, lineHeight: 1.8 }}>
                  <div>Attempted: <strong style={{ color: T.text2 }}>{attempted}</strong></div>
                  <div>Unattempted: <strong style={{ color: T.text3 }}>{unattempted}</strong></div>
                  <div>Lost to penalty: <strong style={{ color: T.red }}>-{lostToWrong}</strong></div>
                  <div>Score: <strong style={{ color: scoreColor(pct(safeScore, 100)) }}>{safeScore.toFixed(1)}</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [syllabi, setSyllabi] = useState([]);
  const [papers, setPapers] = useState([]);
  const [activeSylId, setActiveSylId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("dashboard"); // dashboard | papers | analytics | syllabi
  const [modal, setModal] = useState(null); // null | {type, data}

  useEffect(() => {
    (async () => {
      let syl = await DB.get("syllabi");
      if (!syl || !syl.length) { syl = [DEFAULT_SYLLABUS]; await DB.set("syllabi", syl); }
      const ppr = (await DB.get("papers")) || [];
      setSyllabi(syl);
      setPapers(ppr);
      setActiveSylId(syl[0].id);
      setLoading(false);
    })();
  }, []);

  const activeSyl = syllabi.find(s => s.id === activeSylId) || syllabi[0];
  const activePapers = papers.filter(p => p.syllabusId === activeSylId);

  const saveSyllabi = async (updated) => { setSyllabi(updated); await DB.set("syllabi", updated); };
  const savePapers = async (updated) => { setPapers(updated); await DB.set("papers", updated); };

  const handleSaveSyllabus = async (syl) => {
    const updated = syllabi.find(s => s.id === syl.id) ? syllabi.map(s => s.id === syl.id ? syl : s) : [...syllabi, syl];
    await saveSyllabi(updated);
    setActiveSylId(syl.id);
    setModal(null);
  };

  const handleSavePaper = async (paper) => {
    const updated = papers.find(p => p.id === paper.id) ? papers.map(p => p.id === paper.id ? paper : p) : [...papers, paper];
    await savePapers(updated);
    setModal(null);
    setPage("papers");
  };

  const handleDeleteSyllabus = async (id) => {
    if (!confirm("Delete this syllabus and ALL its papers?")) return;
    await saveSyllabi(syllabi.filter(s => s.id !== id));
    await savePapers(papers.filter(p => p.syllabusId !== id));
    setActiveSylId(syllabi.find(s => s.id !== id)?.id || null);
    setModal(null);
  };

  const handleDeletePaper = async (id) => {
    if (!confirm("Delete this paper entry?")) return;
    await savePapers(papers.filter(p => p.id !== id));
    setModal(null);
  };

  const navItem = (key, label) => (
    <button onClick={() => setPage(key)} style={{
      padding: "10px 18px", fontSize: 13, fontWeight: 600, background: "transparent", border: "none",
      cursor: "pointer", color: page === key ? T.text : T.text3,
      borderBottom: page === key ? `2px solid ${T.accent}` : "2px solid transparent",
      transition: "all 0.15s",
    }}>{label}</button>
  );

  if (loading) return <div style={{ background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: T.text2, fontFamily: "inherit" }}>Loading…</div>;

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: T.text }}>

      {/* Header */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
          <div style={{ padding: "14px 0", marginRight: 24, borderRight: `1px solid ${T.border}`, paddingRight: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text, letterSpacing: "-0.02em" }}>PSC Tracker</div>
            <div style={{ fontSize: 10, color: T.text3 }}>Kerala PSC · MCQ Analytics</div>
          </div>
          {navItem("dashboard", "Dashboard")}
          {navItem("papers", `Papers (${activePapers.length})`)}
          {navItem("analytics", "Analytics")}
          {navItem("syllabi", "Syllabi")}
          {activeSyl && (
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <select value={activeSylId} onChange={e => setActiveSylId(e.target.value)}
                style={{ ...inp, width: "auto", fontSize: 12, padding: "5px 10px" }}>
                {syllabi.map(s => <option key={s.id} value={s.id}>{s.shortName}</option>)}
              </select>
              <button onClick={() => setModal({ type: "addPaper" })} style={{ ...btn(T.accent), padding: "7px 14px", fontSize: 12 }}>+ Add Paper</button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>

        {/* DASHBOARD */}
        {page === "dashboard" && activeSyl && (
          <div>
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>{activeSyl.name}</h1>
                <div style={{ fontSize: 12, color: T.text3, marginTop: 4 }}>
                  {activeSyl.subjects.length} subjects · {activeSyl.totalMarks} marks · Negative: {activeSyl.negMark.toFixed(3)}/wrong &nbsp;·&nbsp; {activePapers.length} paper{activePapers.length !== 1 ? "s" : ""} tracked
                </div>
              </div>
            </div>
            {activePapers.length === 0 ? (
              <div style={{ ...card, textAlign: "center", padding: 60 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                <div style={{ fontSize: 17, color: T.text2, marginBottom: 8 }}>No papers added yet for this syllabus</div>
                <div style={{ fontSize: 13, color: T.text3, marginBottom: 20 }}>Add your first paper to start tracking</div>
                <button onClick={() => setModal({ type: "addPaper" })} style={btn(T.accent)}>+ Add First Paper</button>
              </div>
            ) : (
              <Analytics papers={activePapers} syllabus={activeSyl} />
            )}
          </div>
        )}

        {/* PAPERS LIST */}
        {page === "papers" && activeSyl && (
          <div>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>Papers — {activeSyl.shortName}</h2>
              <button onClick={() => setModal({ type: "addPaper" })} style={btn(T.accent)}>+ Add Paper</button>
            </div>
            {activePapers.length === 0 ? (
              <div style={{ ...card, textAlign: "center", padding: 40, color: T.text3 }}>No papers yet. Add one above.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[...activePapers].reverse().map(p => {
                  const sc = activeSyl.subjects.map(s => { const d = p.subjects?.[s.id] || {}; return calcMarks(d.correct, d.wrong, activeSyl.negMark); });
                  const total = sc.reduce((a, s) => a + s.marks, 0);
                  const totalC = sc.reduce((a, s) => a + s.correct, 0);
                  const totalW = sc.reduce((a, s) => a + s.wrong, 0);
                  const p2 = pct(total, 100);
                  return (
                    <div key={p.id} style={{ ...card, display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 16, alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, color: T.text, fontSize: 14, marginBottom: 4 }}>
                          {p.name || "Unnamed Paper"}
                          {p.code && <span style={{ marginLeft: 10, fontSize: 11, color: T.text3, fontFamily: "monospace" }}>{p.code}</span>}
                          {p.date && <span style={{ marginLeft: 10, fontSize: 11, color: T.text3 }}>{p.date}</span>}
                          {p.pdfData && <span style={{ marginLeft: 8 }}><Badge label="PDF" color={T.cyan} /></span>}
                          {Object.values(p.omr || {}).filter(Boolean).length > 0 && <span style={{ marginLeft: 6 }}><Badge label="OMR" color={T.purple} /></span>}
                        </div>
                        <div style={{ fontSize: 11, color: T.text3 }}>✓ {totalC} correct &nbsp; ✗ {totalW} wrong &nbsp; Unattempted: {100 - totalC - totalW}</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "monospace", fontSize: 24, fontWeight: 900, color: scoreColor(p2) }}>{total.toFixed(1)}</div>
                        <div style={{ fontSize: 10, color: T.text3 }}>/ 100</div>
                      </div>
                      <button onClick={() => setModal({ type: "viewPaper", paper: p })} style={{ ...btnGhost, fontSize: 12 }}>View</button>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setModal({ type: "editPaper", paper: p })} style={{ ...btnGhost, fontSize: 12 }}>Edit</button>
                        <button onClick={() => handleDeletePaper(p.id)} style={{ ...btnGhost, fontSize: 12, color: T.red, borderColor: T.red + "44" }}>Del</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS */}
        {page === "analytics" && activeSyl && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>Analytics — {activeSyl.shortName}</h2>
              <div style={{ fontSize: 12, color: T.text3, marginTop: 4 }}>{activePapers.length} paper(s) analysed</div>
            </div>
            <Analytics papers={activePapers} syllabus={activeSyl} />
          </div>
        )}

        {/* SYLLABI MANAGER */}
        {page === "syllabi" && (
          <div>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>Syllabi Manager</h2>
              <button onClick={() => setModal({ type: "addSyllabus" })} style={btn(T.accent)}>+ New Syllabus</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {syllabi.map(s => (
                <div key={s.id} style={{ ...card, display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 16, alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: T.text, fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>
                      {s.subjects.length} subjects · {s.totalMarks} marks · Neg: {s.negMark.toFixed(3)} ·
                      {papers.filter(p => p.syllabusId === s.id).length} paper(s)
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                      {s.subjects.map(sub => <Badge key={sub.id} label={`${sub.name} (${sub.maxMarks})`} color={T.accent} />)}
                    </div>
                  </div>
                  <button onClick={() => { setActiveSylId(s.id); setPage("dashboard"); }} style={btnGhost}>View</button>
                  <button onClick={() => setModal({ type: "editSyllabus", syllabus: s })} style={btnGhost}>Edit</button>
                  <button onClick={() => handleDeleteSyllabus(s.id)} style={{ ...btnGhost, color: T.red, borderColor: T.red + "44" }}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {modal?.type === "addSyllabus" && <SyllabusEditor onSave={handleSaveSyllabus} onClose={() => setModal(null)} />}
      {modal?.type === "editSyllabus" && <SyllabusEditor initial={modal.syllabus} onSave={handleSaveSyllabus} onClose={() => setModal(null)} />}
      {modal?.type === "addPaper" && activeSyl && <PaperForm syllabus={activeSyl} onSave={handleSavePaper} onClose={() => setModal(null)} />}
      {modal?.type === "editPaper" && activeSyl && <PaperForm syllabus={activeSyl} initial={modal.paper} onSave={handleSavePaper} onClose={() => setModal(null)} />}
      {modal?.type === "viewPaper" && activeSyl && <PaperDetail paper={modal.paper} syllabus={activeSyl} onEdit={() => setModal({ type: "editPaper", paper: modal.paper })} onClose={() => setModal(null)} />}
    </div>
  );
}
