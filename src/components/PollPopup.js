import React from "react";

export default function PollPopup({ poll, onVote, getCurrentTotal }) {
  if (!poll) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9998,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          maxWidth: 600,
          width: "90%",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 12 }}>
          랜덤 매치업 투표
        </h2>

        <div
          style={{
            fontSize: 13,
            textAlign: "center",
            marginBottom: 16,
            color: "#555",
          }}
        >
          250점 이하 팀에서 랜덤으로 두 팀을 가져왔습니다.
          <br />
          누가 더 강하다고 생각하는지 골라주세요!
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {/* 팀 A */}
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 10,
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>
              1팀: {poll.teamA.teamName}
            </div>

            <div style={{ fontSize: 13, marginBottom: 4 }}>
              현재 총점: <b>{getCurrentTotal(poll.teamA)}</b>
            </div>

            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
              {poll.teamA.players.map((p, i) => (
                <li key={i}>
                  {p.name} ({p.coin})
                </li>
              ))}
            </ul>

            <button
              onClick={() => onVote("A")}
              style={{
                marginTop: 8,
                width: "100%",
                padding: "6px 0",
                background: "#1976d2",
                color: "white",
                borderRadius: 6,
                fontWeight: "bold",
              }}
            >
              1팀 선택
            </button>
          </div>

          {/* 팀 B */}
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 10,
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>
              2팀: {poll.teamB.teamName}
            </div>

            <div style={{ fontSize: 13, marginBottom: 4 }}>
              현재 총점: <b>{getCurrentTotal(poll.teamB)}</b>
            </div>

            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
              {poll.teamB.players.map((p, i) => (
                <li key={i}>
                  {p.name} ({p.coin})
                </li>
              ))}
            </ul>

            <button
              onClick={() => onVote("B")}
              style={{
                marginTop: 8,
                width: "100%",
                padding: "6px 0",
                background: "#d32f2f",
                color: "white",
                borderRadius: 6,
                fontWeight: "bold",
              }}
            >
              2팀 선택
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
