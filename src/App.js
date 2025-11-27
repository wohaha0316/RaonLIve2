import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function App() {
  const initialPlayers = [
    { name: "경수", coin: 100, pos: ["PG", "SG"], history: [100] },
    { name: "호성", coin: 94, pos: ["PG", "SF", "PF", "C"], history: [94] },
    { name: "준수", coin: 86, pos: ["SF", "PF", "C"], history: [86] },
    { name: "현욱", coin: 84, pos: ["SF", "SG"], history: [84] },
    { name: "정재", coin: 82, pos: ["SG"], history: [82] },
    { name: "오신", coin: 78, pos: ["PG"], history: [78] },
    { name: "성준", coin: 76, pos: ["PG", "SG"], history: [76] },
    { name: "민준", coin: 66, pos: ["SG", "SF"], history: [66] },
    { name: "유빈", coin: 63, pos: ["PG", "SG", "SF"], history: [63] },
    { name: "종훈", coin: 59, pos: ["PF", "C"], history: [59] },
    { name: "우석", coin: 58, pos: ["PG"], history: [58] },
    { name: "성원", coin: 54, pos: ["PG", "SG"], history: [54] },
    { name: "성민", coin: 52, pos: ["PF", "C"], history: [52] },
    { name: "진국", coin: 49, pos: ["SG", "SF", "PF"], history: [49] },
    { name: "광식", coin: 44, pos: ["SG", "SF"], history: [44] },
    { name: "유강", coin: 45, pos: ["PF", "C"], history: [45] },
    { name: "승현", coin: 43, pos: ["PF", "C"], history: [43] },
    { name: "태준", coin: 42, pos: ["PF", "C"], history: [42] },
    { name: "재형", coin: 41, pos: ["SG", "SF", "PF"], history: [41] },
    { name: "민호", coin: 36, pos: ["SF", "PF"], history: [36] },
    { name: "인테", coin: 35, pos: ["PF", "C"], history: [35] },
    { name: "청우", coin: 31, pos: ["PG"], history: [31] },
    { name: "태원", coin: 28, pos: ["SF", "PF"], history: [28] },
    { name: "강산", coin: 27, pos: ["PG", "SG"], history: [27] },
    { name: "현우", coin: 18, pos: ["PF", "C"], history: [18] },
    { name: "동영", coin: 16, pos: ["SG"], history: [16] },
    { name: "현수", coin: 8, pos: ["SG"], history: [8] },
    { name: "성권", coin: 2, pos: ["SG"], history: [2] },
  ];

  const positions = ["PG", "SG", "SF", "PF", "C"];

  const [players, setPlayers] = useState(initialPlayers);
  const [limit, setLimit] = useState(240);
  const [selected, setSelected] = useState([]);
  const [sortType, setSortType] = useState("coin-desc");
  const [filterPos, setFilterPos] = useState("ALL");
  const [adminMode, setAdminMode] = useState(false);

  const [teamList, setTeamList] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [editingCoin, setEditingCoin] = useState(null);

  // Load players + teams
  useEffect(() => {
    async function loadPlayers() {
      const snap = await getDocs(collection(db, "players"));
      if (!snap.empty) setPlayers(snap.docs.map((d) => d.data()));
    }
    async function loadTeams() {
      const snap = await getDocs(collection(db, "teams"));
      if (!snap.empty) setTeamList(snap.docs.map((d) => d.data()));
    }
    loadPlayers();
    loadTeams();
  }, []);

  function toggleAdmin() {
    if (adminMode) {
      setAdminMode(false);
      alert("관리자 모드 종료");
      return;
    }
    const pw = prompt("관리자 비밀번호:");
    if (pw === "150817") {
      setAdminMode(true);
      alert("관리자 모드 활성화");
    } else alert("비밀번호 오류");
  }

  async function uploadInitialPlayers() {
    for (let p of initialPlayers) {
      await setDoc(doc(db, "players", p.name), p);
    }
    alert("초기 데이터 업로드 완료!");
  }

  const toggleSelect = (name) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  const handleCoinChange = (name, val) => {
    if (!adminMode) return;
    setEditingCoin(name);

    const newCoin = Number(val);
    setPlayers((prev) =>
      prev.map((p) => (p.name === name ? { ...p, coin: newCoin } : p))
    );
  };

  const saveCoinUpdate = async (name) => {
    if (!adminMode) return;

    const target = players.find((p) => p.name === name);
    if (!target) return;

    const newHistory = [...(target.history || []), target.coin];

    await updateDoc(doc(db, "players", name), {
      coin: target.coin,
      history: newHistory,
    });

    setPlayers((prev) =>
      prev.map((p) => (p.name === name ? { ...p, history: newHistory } : p))
    );

    setEditingCoin(null);
  };

  const togglePosition = (name, pos) => {
    if (!adminMode) return;

    const p = players.find((x) => x.name === name);
    if (!p) return;

    const newPos = p.pos.includes(pos)
      ? p.pos.filter((x) => x !== pos)
      : [...p.pos, pos];

    setPlayers((prev) =>
      prev.map((x) => (x.name === name ? { ...x, pos: newPos } : x))
    );

    updateDoc(doc(db, "players", name), { pos: newPos });
  };

  const totalUsed = selected.reduce((s, n) => {
    const p = players.find((x) => x.name === n);
    return s + (p?.coin || 0);
  }, 0);
  const isOver = totalUsed > limit;

  async function saveTeam() {
    if (selected.length === 0) {
      alert("선수를 선택하세요!");
      return;
    }

    const teamName = prompt("팀 이름 입력:");
    if (!teamName) return alert("팀 이름 필요함");

    const creator = prompt("작성자 이름 (관리자만 확인 가능):") || "익명";

    const snapshotPlayers = selected.map((name) => {
      const p = players.find((x) => x.name === name);
      return { name: p.name, coin: p.coin };
    });

    const totalScore = snapshotPlayers.reduce((s, x) => s + x.coin, 0);

    await addDoc(collection(db, "teams"), {
      teamName,
      creator,
      players: snapshotPlayers,
      total: totalScore,
      createdAt: serverTimestamp(),
    });

    const snap = await getDocs(collection(db, "teams"));
    setTeamList(snap.docs.map((d) => d.data()));

    // ✅ 팀 저장 후 선택 선수 초기화
    setSelected([]);

    alert("팀 저장 완료!");
  }

  let filtered =
    filterPos === "ALL"
      ? [...players]
      : players.filter((p) => p.pos.includes(filterPos));

  let sortedPlayers = filtered.sort((a, b) => {
    switch (sortType) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "coin-asc":
        return a.coin - b.coin;
      case "coin-desc":
        return b.coin - a.coin;
      default:
        return 0;
    }
  });

  return (
    <div style={{ padding: 20, maxWidth: 750, margin: "0 auto" }}>
      {/* 관리자 버튼 상단 고정 */}
      <button
        onClick={toggleAdmin}
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          padding: "6px 10px",
          background: adminMode ? "green" : "black",
          color: "white",
          borderRadius: 6,
          fontSize: 12,
          zIndex: 2000,
        }}
      >
        {adminMode ? "관리자 ON" : "관리자"}
      </button>

      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        RAON 드래프트 시스템
      </h1>

      {adminMode && (
        <button
          onClick={uploadInitialPlayers}
          style={{
            padding: 10,
            background: "orange",
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          초기 선수 업로드
        </button>
      )}

      {/* 선택된 선수 */}
      <div
        style={{
          position: "sticky",
          top: 40,
          background: "white",
          padding: 16,
          borderRadius: 10,
          marginBottom: 20,
          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          zIndex: 999,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: "bold" }}>
          선택된 선수 ({selected.length}명)
        </div>

        {selected.length === 0 && (
          <div style={{ marginTop: 4, fontSize: 13, opacity: 0.7 }}>
            선수를 선택하면 여기 표시됩니다.
          </div>
        )}

        {selected.map((name) => {
          const p = players.find((x) => x.name === name);
          if (!p) return null;
          return (
            <div
              key={name}
              style={{
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                {p.name} — <b>{p.coin}</b>점
              </div>
              {/* ✅ 상단에서 바로 제거 버튼 */}
              <button
                onClick={() => toggleSelect(name)}
                style={{
                  marginLeft: 8,
                  padding: "2px 6px",
                  background: "#ccc",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                -
              </button>
            </div>
          );
        })}

        <hr style={{ margin: "12px 0" }} />

        <div
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: isOver ? "red" : "black",
          }}
        >
          현재 점수: {totalUsed} / {limit}
          {isOver && (
            <span style={{ marginLeft: 10, color: "red" }}>(초과!)</span>
          )}
          <button
            onClick={saveTeam}
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
          <button
            onClick={() => setShowModal(true)}
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

      {/* 점수 제한 */}
      <div
        style={{
          background: "#fff",
          padding: 16,
          borderRadius: 10,
          marginBottom: 20,
        }}
      >
        총 사용 가능 점수
        <br />
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          style={{ padding: 6, width: 120, marginTop: 6 }}
        />
      </div>

      {/* 정렬 */}
      <div style={{ marginBottom: 20 }}>
        <label>정렬: </label>
        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          style={{ padding: 6 }}
        >
          <option value="coin-desc">점수 높은순</option>
          <option value="coin-asc">점수 낮은순</option>
          <option value="name-asc">이름순</option>
        </select>
      </div>

      {/* 포지션 필터 */}
      <div style={{ marginBottom: 20 }}>
        <label>포지션 보기: </label>
        <select
          value={filterPos}
          onChange={(e) => setFilterPos(e.target.value)}
          style={{ padding: 6 }}
        >
          <option value="ALL">전체</option>
          {positions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>

      {/* 선수 카드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {sortedPlayers.map((p) => (
          <div
            key={p.name}
            style={{
              background: "#f3f3f3",
              padding: 12,
              borderRadius: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: "bold" }}>{p.name}</span>
              <input
                type="checkbox"
                style={{ transform: "scale(1.4)" }}
                checked={selected.includes(p.name)}
                onChange={() => toggleSelect(p.name)}
              />
            </div>

            <div style={{ marginTop: 8 }}>
              점수:{" "}
              <input
                type="number"
                value={p.coin}
                readOnly={!adminMode}
                onFocus={() => setEditingCoin(p.name)}
                onBlur={() => saveCoinUpdate(p.name)}
                onChange={(e) => handleCoinChange(p.name, e.target.value)}
                style={{ width: 80, padding: 4 }}
              />
            </div>

            {/* 최근 변동 기록 */}
            <div style={{ fontSize: 12, marginTop: 6, opacity: 0.7 }}>
              최근 변동(10개): {(p.history || []).slice(-10).join(", ")}
            </div>

            {/* 등락 그래프 */}
            <div style={{ display: "flex", height: 20, marginTop: 6 }}>
              {(p.history || []).map((v, i) => {
                const prev = i === 0 ? v : p.history[i - 1];
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

            {/* 포지션 */}
            <div style={{ marginTop: 10 }}>
              {positions.map((pos) => (
                <label key={pos} style={{ marginRight: 8 }}>
                  <input
                    type="checkbox"
                    style={{ transform: "scale(1.3)" }}
                    checked={p.pos.includes(pos)}
                    onChange={() => togglePosition(p.name, pos)}
                    disabled={!adminMode}
                  />
                  {pos}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 완료된 팀 모달 */}
      {showModal && (
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
            {/* 닫기 버튼 고정 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                background: "white",
                paddingBottom: 10,
                paddingTop: 5,
                zIndex: 10,
              }}
            >
              <h2>완료된 팀 목록</h2>
              <button
                onClick={() => setShowModal(false)}
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

            {teamList.length === 0 && <div>아직 저장된 팀 없음</div>}

            {/* 팀 카드 2열 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 10,
              }}
            >
              {teamList.map((t, idx) => {
                // 현재 기준 총점 계산
                const currentTotal = t.players.reduce((sum, tp) => {
                  const cur = players.find((p) => p.name === tp.name);
                  return sum + (cur ? cur.coin : tp.coin);
                }, 0);

                const originalTotal = t.total || 0;
                const isImpossible = currentTotal > limit;

                return (
                  <div
                    key={idx}
                    style={{
                      background: isImpossible ? "#ffe5e5" : "#f3f3f3",
                      padding: 10,
                      borderRadius: 8,
                      border: isImpossible ? "1px solid red" : "none",
                    }}
                  >
                    <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                      팀명: {t.teamName}
                    </div>

                    {adminMode && (
                      <div style={{ fontSize: 12, color: "gray" }}>
                        작성자: {t.creator}
                      </div>
                    )}

                    <div style={{ marginTop: 4, fontSize: 13 }}>
                      선수:
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {t.players.map((tp, i) => {
                          const cur = players.find((p) => p.name === tp.name);
                          const curCoin = cur ? cur.coin : null;
                          const changed =
                            curCoin !== null && curCoin !== tp.coin;

                          return (
                            <li key={i}>
                              {tp.name} {!changed && <span>({tp.coin}점)</span>}
                              {changed && (
                                <span>
                                  ({tp.coin}점 → <b>{curCoin}점</b>)
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div style={{ marginTop: 6, fontSize: 13 }}>
                      저장 당시 총점: <b>{originalTotal}</b>점
                      <br />
                      현재 기준 총점:{" "}
                      <b
                        style={{
                          color: isImpossible ? "red" : "black",
                        }}
                      >
                        {currentTotal}
                      </b>
                      점
                    </div>

                    {isImpossible && (
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 12,
                          color: "red",
                          fontWeight: "bold",
                        }}
                      >
                        현재 가격 기준으로는 존재 불가능한 팀
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
