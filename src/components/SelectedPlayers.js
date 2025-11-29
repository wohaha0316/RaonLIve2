import React from "react";

export default function SelectedPlayers({
  selected,
  players,
  limit,
  totalUsed,
  isOver,
  onRemove,
  onSaveTeam,
  onShowModal,
}) {
  return (
    <div
      style={{
        position: "sticky",
        top: 10,
        background: "white",
        padding: 16,
        borderRadius: 10,
        marginBottom: 20,
        boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
        zIndex: 50,
      }}
    >
      {/* 제목 */}
      <div style={{ fontSize: 18, fontWeight: "bold" }}>
        선택된 선수 ({selected.length}명)
      </div>

      {/* 선택된 선수 없음 */}
      {selected.length === 0 && (
        <div style={{ marginTop: 4, opacity: 0.7 }}>선수 없음</div>
      )}

      {/* 선택된 선수 목록 */}
      {selected.map((name) => {
        const p = players.find((x) => x.name === name);
        if (!p) return null;

        return (
          <div
            key={name}
            style={{
              marginTop: 6,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              {p.name} ({p.pos.join("/")}) — <b>{p.coin}</b>점
            </div>
            <button
              onClick={() => onRemove(name)}
              style={{
                padding: "0px 8px",
                background: "red",
                color: "white",
                borderRadius: 4,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              -
            </button>
          </div>
        );
      })}

      <hr style={{ margin: "12px 0" }} />

      {/* 현재 점수 + 팀 확정 + 완료된 팀 보기 */}
      <div
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: isOver ? "red" : "black",
          display: "flex",
          alignItems: "center",
        }}
      >
        현재 점수: {totalUsed} / {limit}
        {isOver && <span style={{ marginLeft: 10 }}>(초과!)</span>}
        {/* 팀 확정 버튼 */}
        <button
          onClick={onSaveTeam}
          style={{
            marginLeft: 10,
            padding: "6px 12px",
            background: "blue",
            color: "white",
            borderRadius: 8,
          }}
        >
          팀 확정
        </button>
        {/* 완료된 팀 보기 버튼 — **절대 disabled 없음** */}
        <button
          onClick={onShowModal}
          style={{
            marginLeft: 10,
            padding: "6px 12px",
            background: "#444",
            color: "white",
            borderRadius: 8,
          }}
        >
          완료된 팀 보기
        </button>
      </div>
    </div>
  );
}
