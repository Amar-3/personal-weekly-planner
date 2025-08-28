import React, { useEffect, useMemo, useState } from "react";
import ScheduleTable from "./components/ScheduleTable";
import { DEFAULT_TASKS } from "./data";
import { downloadPDF } from "./utility/file";
import { startOfISOWeek, isoWeekKey } from "./utility/dateTime";


// ------------------ Component ------------------
function App() {
  const [weekKey, setWeekKey] = useState(isoWeekKey());
  const [data, setData] = useState(() => {
    const raw = localStorage.getItem("tracker-data");
    return raw ? JSON.parse(raw) : {};
  });
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  // ------------------ THEME ------------------
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.body.classList.remove("dark", "light");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  }

  // ------------------ Week Data ------------------
  const weekStart = useMemo(() => startOfISOWeek(new Date()), []);
  const weekData ={
    tasks: DEFAULT_TASKS.map(t => ({ ...t })),
    checks: {}, // key: taskId-day -> true/false
    notes: ""
  };
  function setWeekData(updater) {
    setData(prev => {
      const next = { ...prev, [weekKey]: updater(prev[weekKey] || weekData) };
      return next;
    });
  }

  useEffect(() => {
    localStorage.setItem("tracker-data", JSON.stringify(data));
  }, [data]);

 

  // ------------------ Handlers ------------------
  function toggle(taskId, dayIdx) {
    setWeekData(cur => {
      const checks = { ...(cur.checks || {}) };
      const key = `${taskId}-${dayIdx}`;
      checks[key] = !checks[key];
      return { ...cur, checks };
    });
  }

  function toggleAll(dayIdx, value) {
    setWeekData(cur => {
      const checks = { ...(cur.checks || {}) };
      (cur.tasks || []).forEach(t => {
        checks[`${t.id}-${dayIdx}`] = value;
      });
      return { ...cur, checks };
    });
  }

  function resetWeek() {
    if (!window.confirm("Reset all checkboxes for this week?")) return;
    setWeekData(cur => ({ ...cur, checks: {} }));
  }

  function exportJSON() {
    const payload = JSON.stringify({ [weekKey]: weekData }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tracker-${weekKey}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        setData(prev => ({ ...prev, ...obj }));
        const keys = Object.keys(obj);
        if (keys.length) setWeekKey(keys[0]);
        alert("Imported!");
      } catch (err) {
        alert("Invalid JSON");
      }
    };
    reader.readAsText(file);
  }

  const weekLabel = useMemo(() => {
    const monday = startOfISOWeek(new Date());
    const end = new Date(monday);
    end.setDate(monday.getDate() + 6);
    return `${monday.toDateString()} – ${end.toDateString()}`;
  }, []);

  // broser full screen mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        alert(`Error attempting fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }


  // ------------------ Render ------------------
  return (
    <div className="wrapper">
      <div className="card">
        <h1>Weekly Trading Tracker</h1>
        <p className="subtle">
        Structured, goal-oriented, and consistent across trading, health, and growth.
        </p>

        <div className="flex">
          <div className="badge">Week: {weekKey}</div>
          <div className="small">({weekLabel})</div>
          <div className="grow" />
          <label className="ghost">
            Import JSON
            <input type="file" accept="application/json" onChange={importJSON} style={{ display: "none" }} />
          </label>
          <button onClick={exportJSON}>Export JSON</button>
          <button onClick={resetWeek}>Reset Week</button>
          <button onClick={() => window.print()}>Print</button>
          <button onClick={downloadPDF}>Download PDF</button>
          <button onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? "light" : "dark"}
          </button>
          <button onClick={toggleFullscreen} title="Toggle fullscreen">
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>

        </div>

        <hr className="sep" />

        <div className="table-wrap">
          <ScheduleTable
            days={DAYS}
            tasks={weekData.tasks}
            checks={weekData.checks || {}}
            onToggle={toggle}
            onToggleAll={toggleAll}
          />
        </div>

        <hr className="sep" />

        <div>
          <label className="small">Notes & reflections</label>
          <textarea
            value={weekData.notes}
            onChange={(e) => setWeekData(cur => ({ ...cur, notes: e.target.value }))}
            rows={4}
            style={{
              width: "100%",
              background: "var(--bg-secondary)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 10
            }}
            placeholder="Log mood stability, physical energy, willingness, and lessons learned."
          />
        </div>
      </div>
    </div>
  );
}

export default App;
