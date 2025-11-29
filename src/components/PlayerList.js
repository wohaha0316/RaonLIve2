// src/components/PlayerList.js
import React from "react";
import PlayerCard from "./PlayerCard";

export default function PlayerList({
  players,
  selected,
  positions,
  adminMode,
  onToggle,
  onCoinChange,
  onCoinSave,
  onTogglePosition,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
      }}
    >
      {players.map((p) => (
        <PlayerCard
          key={p.name}
          player={p}
          isSelected={selected.includes(p.name)}
          adminMode={adminMode}
          positions={positions}
          onToggle={onToggle}
          onCoinChange={onCoinChange}
          onCoinSave={onCoinSave}
          onTogglePosition={onTogglePosition}
        />
      ))}
    </div>
  );
}
