import React from "react";

export default function ScheduleTable({ days, tasks, checks, onToggle, onToggleAll }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Task</th>
          <th className="center">Time Period</th>
          <th className="center">Duration (min)</th>
          {days.map((d, i) => (
            <th key={i} className="center">
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
                <span>{d}</span>
                {/* <input type="checkbox"
                  onChange={(e)=> onToggleAll(i, e.target.checked)}
                  title={`Check/uncheck all for ${d}`}
                /> */}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tasks.map((t) => (
          <tr key={t.id}>
            <td>{t.name}</td>
            <td className="center">{t.time}</td>
            <td className="center">{t.duration}</td>
            {days.map((_, dayIdx) => {
              const key = `${t.id}-${dayIdx}`;
              return (
                <td key={dayIdx} className="center">
                  <input
                    type="checkbox"
                    checked={!!checks[key]}
                    onChange={() => onToggle(t.id, dayIdx)}
                    aria-label={`${t.name} ${days[dayIdx]}`}
                  />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
