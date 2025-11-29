// src/components/PlayerCard.js
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function PlayerCard({
  player,
  isSelected,
  adminMode,
  positions,
  onToggle,
  onCoinChange,
  onCoinSave,
  onTogglePosition,
  teamList, // ⬅ 추가된 부분 (픽률 계산용)
}) {
  if (!player.history) player.history = [player.coin];

  const recentHistory = player.history.slice(-10);

  // 그래프 데이터
  const chartData = recentHistory.map((v, i) => ({
    step: i + 1,
    value: v,
  }));

  // 변화량 계산
  let delta = 0;
  if (player.history.length >= 2) {
    const last = player.history[player.history.length - 1];
    const prev = player.history[player.history.length - 2];
    delta = last - prev;
  }

  let color = "#888";
  if (delta > 0) color = "red";
  else if (delta < 0) color = "blue";

  // Y축 최소/최대
  const minY = Math.min(...recentHistory);
  const maxY = Math.max(...recentHistory);
  const safeMin = minY === maxY ? minY - 1 : minY;
  const safeMax = minY === maxY ? maxY + 1 : maxY;

  // -----------------------------
  //       ⬇ 픽률 계산 추가 ⬇
  // -----------------------------
  let pickRate = 0;
  if (teamList && teamList.length > 0) {
    const pickedTeams = teamList.filter((t) =>
      t.players.some((tp) => tp.name === player.name)
    ).length;

    pickRate = ((pickedTeams / teamList.length) * 100).toFixed(1);
  }

  // ────────────────────────────────────────────────

  return (
    <div
      style={{
        background: isSelected ? "#e3f2fd" : "white",
        border: "1px solid #ddd",
        padding: 6,
        borderRadius: 12,
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ▣ 1. 이름, 점수입력, 선택버튼 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 65px 55px",
          alignItems: "center",
          marginBottom: 3,
          columnGap: 4,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: "bold" }}>{player.name}</div>

        <input
          type="number"
          disabled={!adminMode}
          value={player.coin}
          onChange={(e) => onCoinChange(player.name, e.target.value)}
          style={{
            width: "100%",
            padding: "3px 4px",
            fontSize: 13,
            fontWeight: "bold",
          }}
        />

        <button
          onClick={() => onToggle(player.name)}
          style={{
            width: "100%",
            padding: "3px 4px",
            background: isSelected ? "red" : "black",
            color: "white",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: "bold",
          }}
        >
          {isSelected ? "취소" : "선택"}
        </button>
      </div>

      {/* 저장 + 변화량 + 픽률 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 3,
          gap: 6,
        }}
      >
        {adminMode && (
          <button
            onClick={() => onCoinSave(player.name)}
            style={{
              padding: "3px 4px",
              background: "#333",
              color: "white",
              borderRadius: 6,
              fontSize: 10,
            }}
          >
            저장
          </button>
        )}

        {delta !== 0 && (
          <span style={{ fontSize: 11, fontWeight: "bold", color }}>
            ({delta > 0 ? "+" + delta : delta})
          </span>
        )}

        {/* ✔ 픽률 표시 */}
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            fontWeight: "bold",
            color: "#444",
          }}
        >
          픽률: {pickRate}%
        </span>
      </div>

      {/* 최근 변동 10개 텍스트 */}
      <div
        style={{
          fontSize: 9,
          color: "#555",
          marginBottom: 2,
          lineHeight: 1.2,
        }}
      >
        최근 10개: {recentHistory.join(" → ")}
      </div>

      {/* 그래프 */}
      <div style={{ width: "100%", height: 95, marginBottom: 2 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <XAxis dataKey="step" hide />
            <YAxis domain={[safeMin, safeMax]} hide />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 포지션 수정 */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          marginTop: 2,
        }}
      >
        {positions.map((pos) => (
          <span
            key={pos}
            onClick={() => adminMode && onTogglePosition(player.name, pos)}
            style={{
              padding: "3px 5px",
              borderRadius: 6,
              cursor: adminMode ? "pointer" : "default",
              background: player.pos.includes(pos) ? "#4caf50" : "#9e9e9e",
              color: "white",
              fontSize: 10,
              fontWeight: "bold",
            }}
          >
            {pos}
          </span>
        ))}
      </div>
    </div>
  );
}
