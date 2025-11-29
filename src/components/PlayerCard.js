import React from "react";

export default function PlayerCard({
  player,
  selected,
  onToggle,
  adminMode,
  onCoinChange,
  onCoinSave,
  onTogglePosition,
  positions,
}) {
  return (
    <div style={{ background: "#f3f3f3", padding: 12, borderRadius: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: "bold" }}>{player.name}</span>

        <input
          type="checkbox"
          style={{ transform: "scale(1.4)" }}
          checked={selected}
          onChange={onToggle}
        />
      </div>

      <div style={{ marginTop: 8 }}>
        점수:{" "}
        <input
          type="number"
          value={player.coin}
          readOnly={!adminMode}
          onChange={(e) => onCoinChange(player.name, e.target.value)}
          onBlur={() => onCoinSave(player.name)}
          style={{
            width: 80,
            padding: 4,
            fontSize: 18,
            fontWeight: "bold",
          }}
        />
      </div>

      <div style={{ fontSize: 12, marginTop: 6, opacity: 0.7 }}>
        최근 변동(10개): {(player.history || []).slice(-10).join(", ")}
      </div>

      <div style={{ display: "flex", height: 20, marginTop: 6 }}>
        {(player.history || []).map((v, i) => {
          const prev = i === 0 ? v : player.history[i - 1];
          const up = v > prev;
          const same = v === prev;

          return (
            <div
              key={i}
              style={{
                width: 6,
                height: same ? 10 : up ? 18 : 5,
                marginRight: 2,
                background: same ? "gray" : up ? "red" : "blue",
              }}
            />
          );
        })}
      </div>

      <div style={{ marginTop: 10 }}>
        {positions.map((pos) => (
          <label key={pos} style={{ marginRight: 8 }}>
            <input
              type="checkbox"
              style={{ transform: "scale(1.3)" }}
              checked={player.pos.includes(pos)}
              disabled={!adminMode}
              onChange={() => onTogglePosition(player.name, pos)}
            />
            {pos}
          </label>
        ))}
      </div>
    </div>
  );
}
