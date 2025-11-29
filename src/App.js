import React, { useState, useEffect, useRef } from "react";
import { db } from "./firebase";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import HeaderBar from "./components/HeaderBar";
import SelectedPlayers from "./components/SelectedPlayers";
import PlayerList from "./components/PlayerList";
import TeamModal from "./components/TeamModal";
import PollPopup from "./components/PollPopup";

import { applyInvisibleHand } from "./utils/invisibleHand";
import { saveTeamToDB, saveVote } from "./utils/firebaseTeam";

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

  // STATE
  const [players, setPlayers] = useState(initialPlayers);
  const [selected, setSelected] = useState([]);
  const [limit, setLimit] = useState(240);
  const [sortType, setSortType] = useState("coin-desc");
  const [filterPos, setFilterPos] = useState("ALL");
  const [teamList, setTeamList] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [adminMode, setAdminMode] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [poll, setPoll] = useState(null);

  const [activeSort, setActiveSort] = useState("time");
  const [timeSortAsc, setTimeSortAsc] = useState(false);
  const [scoreSortAsc, setScoreSortAsc] = useState(false);
  const [winRateAsc, setWinRateAsc] = useState(false); // ✅ 승률 정렬용

  // ⛔ 중복 팝업 방지 — useRef 사용
  const lastTriggeredMinuteRef = useRef(null);

  // 공사중 모드 로드
  useEffect(() => {
    async function loadMaintenance() {
      const ref = doc(db, "system", "settings");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setMaintenanceMode(snap.data().maintenance === true);
      }
    }
    loadMaintenance();
  }, []);

  // 공사중 토글
  async function toggleMaintenance() {
    const newVal = !maintenanceMode;
    setMaintenanceMode(newVal);
    await setDoc(doc(db, "system", "settings"), { maintenance: newVal });
  }

  // Firestore load
  useEffect(() => {
    async function loadPlayers() {
      const snap = await getDocs(collection(db, "players"));
      if (!snap.empty) {
        const loaded = snap.docs.map((d) => ({
          ...d.data(),
          history: d.data().history || [d.data().coin],
          trend: d.data().trend || [],
        }));
        setPlayers(loaded);
      }
    }

    async function loadTeams() {
      const snap = await getDocs(collection(db, "teams"));
      setTeamList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }

    loadPlayers();
    loadTeams();
  }, []);

  // 관리자
  function toggleAdmin() {
    if (adminMode) return setAdminMode(false);
    const pw = prompt("관리자 비밀번호:");
    if (pw === "150817") setAdminMode(true);
    else alert("비밀번호 오류");
  }

  // 선수 선택
  const toggleSelect = (name) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  // 점수 변경
  const handleCoinChange = (name, val) => {
    if (!adminMode) return;
    setPlayers((prev) =>
      prev.map((p) => (p.name === name ? { ...p, coin: Number(val) } : p))
    );
  };

  const saveCoinUpdate = async (name) => {
    const p = players.find((x) => x.name === name);
    if (!p) return;

    const newHistory = [...(p.history || []), p.coin];

    await updateDoc(doc(db, "players", name), {
      coin: p.coin,
      history: newHistory,
    });

    setPlayers((prev) =>
      prev.map((x) => (x.name === name ? { ...x, history: newHistory } : x))
    );
  };

  // 포지션 토글
  const togglePosition = (name, pos) => {
    if (!adminMode) return;

    const p = players.find((x) => x.name === name);
    if (!p) return;

    const newPos = p.pos.includes(pos)
      ? p.pos.filter((x) => x !== pos)
      : [...p.pos, pos];

    updateDoc(doc(db, "players", name), { pos: newPos });

    setPlayers((prev) =>
      prev.map((x) => (x.name === name ? { ...x, pos: newPos } : x))
    );
  };

  function getCurrentTotal(team) {
    return team.players.reduce((sum, tp) => {
      const cur = players.find((p) => p.name === tp.name);
      return sum + (cur ? cur.coin : tp.coin);
    }, 0);
  }

  // 팀 저장
  async function saveTeam() {
    if (selected.length === 0) return alert("선수를 선택하세요.");

    const totalUsed = selected.reduce((s, n) => {
      const p = players.find((x) => x.name === n);
      return s + (p?.coin || 0);
    }, 0);

    if (totalUsed > limit) return alert("총점 제한 초과");

    const teamName = prompt("팀 이름:");
    if (!teamName) return;

    const creator = prompt("작성자(선택):") || "익명";

    const snapshotPlayers = selected.map((name) => {
      const p = players.find((x) => x.name === name);
      return { name: p.name, coin: p.coin };
    });

    await saveTeamToDB(db, snapshotPlayers, teamName, creator);

    // reload
    const snap = await getDocs(collection(db, "teams"));
    setTeamList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));

    // invisible hand
    const updated = applyInvisibleHand(players, selected);
    setPlayers(updated);

    // DB 업데이트
    for (let p of updated) {
      await updateDoc(doc(db, "players", p.name), {
        coin: p.coin,
        history: p.history,
        trend: p.trend,
      });
    }

    setSelected([]);
  }

  // 선수 정렬/필터
  const sortedPlayers = players
    .filter((p) => (filterPos === "ALL" ? true : p.pos.includes(filterPos)))
    .sort((a, b) => {
      if (sortType === "name-asc") return a.name.localeCompare(b.name);
      if (sortType === "coin-asc") return a.coin - b.coin;
      return b.coin - a.coin;
    });

  // 팀 정렬
  const sortedTeamList = [...teamList].sort((a, b) => {
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
      const Aw = a.wins || 0;
      const Al = a.losses || 0;
      const Bw = b.wins || 0;
      const Bl = b.losses || 0;

      const A_rate = Aw + Al === 0 ? 0 : Aw / (Aw + Al);
      const B_rate = Bw + Bl === 0 ? 0 : Bw / (Bw + Bl);

      return winRateAsc ? A_rate - B_rate : B_rate - A_rate;
    }
    return 0;
  });

  // 랜덤 2팀
  function pickTwoTeams() {
    const valid = teamList.filter((t) => (t.total || 0) <= 250);
    if (valid.length < 2) return null;
    const shuffled = [...valid].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
  }

  // ⏰ 10분 단위마다 팝업
  useEffect(() => {
    if (teamList.length < 2) return;

    const interval = setInterval(() => {
      const now = new Date();
      const minute = now.getMinutes();

      if (poll) return; // 팝업 떠있으면 중지

      // 같은 분에 중복 실행 방지
      if (lastTriggeredMinuteRef.current === minute) return;

      // 00, 10, 20, 30, 40, 50
      if (minute % 10 === 0) {
        const picked = pickTwoTeams();
        if (picked) {
          setPoll({ teamA: picked[0], teamB: picked[1] });
          lastTriggeredMinuteRef.current = minute;
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [teamList, poll]);

  // 투표 처리
  async function handleVote(winnerKey) {
    if (!poll) return;

    const winner = winnerKey === "A" ? poll.teamA : poll.teamB;
    const loser = winnerKey === "A" ? poll.teamB : poll.teamA;

    await saveVote(db, poll, winner, loser);

    setTeamList((prev) =>
      prev.map((t) => {
        if (t.id === winner.id) return { ...t, wins: (t.wins || 0) + 1 };
        if (t.id === loser.id) return { ...t, losses: (t.losses || 0) + 1 };
        return t;
      })
    );

    setPoll(null);
  }

  // 공사중 화면
  if (maintenanceMode && !adminMode) {
    return (
      <div
        style={{
          background: "black",
          color: "white",
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          fontSize: 40,
          fontWeight: "bold",
          position: "relative",
        }}
      >
        <button
          onClick={toggleAdmin}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            padding: "6px 10px",
            background: "black",
            color: "white",
            border: "2px solid white",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          관리자
        </button>
        RAON 화이팅! 🔥💪
      </div>
    );
  }

  const totalUsed = selected.reduce((s, n) => {
    const p = players.find((x) => x.name === n);
    return s + (p?.coin || 0);
  }, 0);

  return (
    <div style={{ padding: 20, maxWidth: 750, margin: "0 auto" }}>
      <HeaderBar
        adminMode={adminMode}
        maintenance={maintenanceMode}
        onToggleAdmin={toggleAdmin}
        onToggleMaintenance={toggleMaintenance}
      />

      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        RAON 드래프트 시스템
      </h1>

      <SelectedPlayers
        selected={selected}
        players={players}
        limit={limit}
        totalUsed={totalUsed}
        isOver={totalUsed > limit}
        onRemove={(name) =>
          setSelected((prev) => prev.filter((x) => x !== name))
        }
        onSaveTeam={saveTeam}
        onShowModal={() => setShowModal(true)}
      />

      {/* Limit */}
      <div
        style={{
          background: "white",
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
          disabled={!adminMode}
          onChange={(e) => setLimit(Number(e.target.value))}
          style={{ padding: 6, width: 120, marginTop: 6, fontWeight: "bold" }}
        />
      </div>

      {/* Sort */}
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

      {/* Position filter */}
      <div style={{ marginBottom: 20 }}>
        <label>포지션 보기: </label>
        <select
          value={filterPos}
          onChange={(e) => setFilterPos(e.target.value)}
          style={{ padding: 6 }}
        >
          <option value="ALL">전체</option>
          {positions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Player list */}
      <PlayerList
        players={sortedPlayers}
        selected={selected}
        positions={positions}
        adminMode={adminMode}
        onToggle={toggleSelect}
        onCoinChange={handleCoinChange}
        onCoinSave={saveCoinUpdate}
        onTogglePosition={togglePosition}
      />

      {/* Completed Teams */}
      {showModal && (
        <TeamModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          teams={sortedTeamList}
          players={players}
          limit={limit}
          adminMode={adminMode}
          activeSort={activeSort}
          setActiveSort={setActiveSort}
          timeSortAsc={timeSortAsc}
          setTimeSortAsc={setTimeSortAsc}
          scoreSortAsc={scoreSortAsc}
          setScoreSortAsc={setScoreSortAsc}
          winRateAsc={winRateAsc}
          setWinRateAsc={setWinRateAsc}
          getCurrentTotal={getCurrentTotal}
        />
      )}

      {/* Poll popup */}
      <PollPopup
        poll={poll}
        onVote={handleVote}
        getCurrentTotal={getCurrentTotal}
      />
    </div>
  );
}
