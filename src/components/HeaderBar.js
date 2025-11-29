import React from "react";

export default function HeaderBar({
  adminMode,
  maintenance,
  onToggleAdmin,
  onToggleMaintenance,
  showAnalytics,
  onToggleAnalytics,
}) {
  return (
    <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
      {/* 관리자 버튼 */}
      <button
        onClick={onToggleAdmin}
        style={{
          padding: "6px 10px",
          background: adminMode ? "green" : "black",
          color: "white",
          borderRadius: 6,
          fontSize: 12,
        }}
      >
        {adminMode ? "관리자 ON" : "관리자"}
      </button>

      {/* 공사중 토글 (관리자 전용) */}
      {adminMode && (
        <button
          onClick={onToggleMaintenance}
          style={{
            marginLeft: 10,
            padding: "6px 10px",
            background: maintenance ? "red" : "#555",
            color: "white",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          {maintenance ? "공사중 해제" : "공사중"}
        </button>
      )}

      {/* 분석 화면 버튼 (누구나 볼 수 있음) */}
      <button
        onClick={onToggleAnalytics}
        style={{
          marginLeft: 10,
          padding: "6px 10px",
          background: showAnalytics ? "#1976d2" : "#444",
          color: "white",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: "bold",
        }}
      >
        📊 분석 화면
      </button>
    </div>
  );
}
