import React from "react";

export default function HeaderBar({
  adminMode,
  maintenance,
  onToggleAdmin,
  onToggleMaintenance,
}) {
  return (
    <div style={{ marginBottom: 20 }}>
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
    </div>
  );
}
