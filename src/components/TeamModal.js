import React from "react";

export default function TeamModal({
  visible,
  onClose,
  teams,
  players,
  adminMode,
  limit,
  activeSort,
  setActiveSort,
  timeSortAsc,
  setTimeSortAsc,
  scoreSortAsc,
  setScoreSortAsc,
  winRateAsc,
  setWinRateAsc,
  getCurrentTotal,
}) {
  if (!visible) return null;

  const sortedTeamList = [...teams].sort((a, b) => {
    if (activeSort === "time") {
      const A = a.createdAt?.seconds || 0;
      const B = b.createdAt?.seconds || 0;
      return timeSortAsc ? A - B : B - A;
    }

    if (activeSort === "score") {
      const A = a.total || 0;
      const B = b.total || 0;
      return scoreSortAsc ? A - B : B - A;
    }

    if (activeSort === "winrate") {
      const Aw = a.wins || 0,
        Al = a.losses || 0;
      const Bw = b.wins || 0,
        Bl = b.losses || 0;

      const A_rate = Aw + Al === 0 ? 0 : Aw / (Aw + Al);
      const B_rate = Bw + Bl === 0 ? 0 : Bw / (Bw + Bl);

      return winRateAsc ? A_rate - B_rate : B_rate - A_rate;
    }

    return 0;
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: 500,
          background: "white",
          padding: 20,
          borderRadius: 12,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {/* 상단 닫기 영역 */}
        <div
          style={{
            position: "sticky",
            top: 0,
            background: "white",
            paddingBottom: 10,
            paddingTop: 5,
            zIndex: 10,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <h2>완료된 팀 목록</h2>

          <button
            onClick={onClose}
            style={{
              background: "red",
              color: "white",
              borderRadius: 6,
              padding: "4px 10px",
            }}
          >
            X
          </button>
        </div>

        {/* 정렬 버튼 */}
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button
            onClick={() => {
              setActiveSort("time");
              setTimeSortAsc(!timeSortAsc);
            }}
            style={{
              padding: "6px 10px",
              background: activeSort === "time" ? "#222" : "#666",
              color: "white",
              borderRadius: 6,
              fontWeight: "bold",
            }}
          >
            시간순 {timeSortAsc ? "▲" : "▼"}
          </button>

          <button
            onClick={() => {
              setActiveSort("score");
              setScoreSortAsc(!scoreSortAsc);
            }}
            style={{
              padding: "6px 10px",
              background: activeSort === "score" ? "#222" : "#666",
              color: "white",
              borderRadius: 6,
              fontWeight: "bold",
            }}
          >
            점수순 {scoreSortAsc ? "▲" : "▼"}
          </button>

          <button
            onClick={() => {
              setActiveSort("winrate");
              setWinRateAsc(!winRateAsc);
            }}
            style={{
              padding: "6px 10px",
              background: activeSort === "winrate" ? "#222" : "#666",
              color: "white",
              borderRadius: 6,
              fontWeight: "bold",
            }}
          >
            승률순 {winRateAsc ? "▲" : "▼"}
          </button>
        </div>

        {/* 팀 카드 2열 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {sortedTeamList.map((t) => {
            const currentTotal = getCurrentTotal(t);
            const impossible = currentTotal > limit;

            const wins = t.wins || 0;
            const losses = t.losses || 0;
            const games = wins + losses;
            const winRate = games === 0 ? 0 : Math.round((wins / games) * 100);

            const createdAtDate =
              t.createdAt && t.createdAt.toDate ? t.createdAt.toDate() : null;

            return (
              <div
                key={t.id}
                style={{
                  background: impossible ? "#ffe5e5" : "#f3f3f3",
                  padding: 10,
                  borderRadius: 8,
                  border: impossible ? "1px solid red" : "none",
                }}
              >
                <div style={{ fontWeight: "bold" }}>팀명: {t.teamName}</div>

                <div style={{ fontSize: 11, color: "#333", marginTop: 2 }}>
                  ({games}전 {wins}승 {losses}패, 승률 {winRate}%)
                </div>

                {createdAtDate && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#555",
                      marginTop: 2,
                    }}
                  >
                    생성: {createdAtDate.toLocaleString()}
                  </div>
                )}

                {adminMode && (
                  <div style={{ fontSize: 12, color: "gray" }}>
                    작성자: {t.creator}
                  </div>
                )}

                <div style={{ marginTop: 6 }}>
                  선수:
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {t.players.map((tp, i) => {
                      const cur = players.find((p) => p.name === tp.name);
                      const curCoin = cur ? cur.coin : tp.coin;
                      const changed = cur && cur.coin !== tp.coin;

                      return (
                        <li key={i}>
                          {tp.name} {!changed && <span>({tp.coin})</span>}
                          {changed && (
                            <span>
                              ({tp.coin} → <b>{curCoin}</b>)
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div style={{ marginTop: 6, fontSize: 13 }}>
                  저장 당시 총점: <b>{t.total}</b>
                  <br />
                  현재 총점:{" "}
                  <b style={{ color: impossible ? "red" : "black" }}>
                    {currentTotal}
                  </b>
                </div>

                {impossible && (
                  <div
                    style={{
                      marginTop: 6,
                      color: "red",
                      fontWeight: "bold",
                      fontSize: 12,
                    }}
                  >
                    현재 기준 불가능한 팀
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
