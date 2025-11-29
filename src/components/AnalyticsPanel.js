import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPanel({ players, teams, onBack }) {
  const totalPlayers = players.length || 0;

  // ---- 기본 통계 / 상승·하락 -----------------------------------
  const summary = useMemo(() => {
    if (players.length === 0) {
      return {
        avgCoinNow: 0,
        avgCoinPrev: 0,
        avgDelta: 0,
        risingCount: 0,
        fallingCount: 0,
        unchangedCount: 0,
        maxRiser: null,
        maxFaller: null,
        avgHistoryLen: 0,
      };
    }

    let sumNow = 0;
    let sumPrev = 0;
    let sumDelta = 0;
    let risingCount = 0;
    let fallingCount = 0;
    let unchangedCount = 0;
    let sumHistoryLen = 0;

    let maxRiser = null;
    let maxFaller = null;

    players.forEach((p) => {
      const history = p.history || [p.coin];
      const len = history.length;
      sumHistoryLen += len;

      const now = history[len - 1] ?? p.coin;
      const prev = len >= 2 ? history[len - 2] : now;

      const delta = now - prev;

      sumNow += now;
      sumPrev += prev;
      sumDelta += delta;

      if (delta > 0) risingCount += 1;
      else if (delta < 0) fallingCount += 1;
      else unchangedCount += 1;

      if (!maxRiser || delta > maxRiser.delta) {
        maxRiser = { name: p.name, delta };
      }
      if (!maxFaller || delta < maxFaller.delta) {
        maxFaller = { name: p.name, delta };
      }
    });

    const avgCoinNow = sumNow / players.length;
    const avgCoinPrev = sumPrev / players.length;
    const avgDelta = sumDelta / players.length;
    const avgHistoryLen = sumHistoryLen / players.length;

    return {
      avgCoinNow,
      avgCoinPrev,
      avgDelta,
      risingCount,
      fallingCount,
      unchangedCount,
      maxRiser,
      maxFaller,
      avgHistoryLen,
    };
  }, [players]);

  // ---- 전체 평균 점수 추이 (draft step 기준) --------------------
  const avgHistorySeries = useMemo(() => {
    let maxLen = 0;
    players.forEach((p) => {
      const len = (p.history || []).length;
      if (len > maxLen) maxLen = len;
    });

    const result = [];
    for (let i = 0; i < maxLen; i++) {
      let sum = 0;
      let count = 0;
      players.forEach((p) => {
        const h = p.history || [];
        if (h[i] != null) {
          sum += h[i];
          count += 1;
        }
      });
      result.push({
        step: i + 1,
        avg: count ? Number((sum / count).toFixed(2)) : 0,
      });
    }
    return result;
  }, [players]);

  // ---- 선수별 현재 점수 TOP 10 --------------------------------
  const topCurrentScore = useMemo(() => {
    const list = players
      .map((p) => {
        const history = p.history || [p.coin];
        const now = history[history.length - 1] ?? p.coin;
        return { name: p.name, coin: now };
      })
      .sort((a, b) => b.coin - a.coin)
      .slice(0, 10);

    return list;
  }, [players]);

  // ---- 선수별 최근 상승/하락 -----------------------------------
  const deltaList = useMemo(() => {
    return players.map((p) => {
      const history = p.history || [p.coin];
      const len = history.length;
      const now = history[len - 1] ?? p.coin;
      const prev = len >= 2 ? history[len - 2] : now;
      const delta = now - prev;
      return { name: p.name, delta, now, prev };
    });
  }, [players]);

  const topRisers = useMemo(() => {
    return deltaList
      .filter((d) => d.delta > 0)
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 10);
  }, [deltaList]);

  const topFallers = useMemo(() => {
    return deltaList
      .filter((d) => d.delta < 0)
      .sort((a, b) => a.delta - b.delta)
      .slice(0, 10);
  }, [deltaList]);

  // ---- 포지션별 평균 점수 / 평균 변화 -------------------------
  const posStats = useMemo(() => {
    const posMap = new Map(); // pos -> { sumCoin, sumDelta, count }

    players.forEach((p) => {
      const history = p.history || [p.coin];
      const len = history.length;
      const now = history[len - 1] ?? p.coin;
      const prev = len >= 2 ? history[len - 2] : now;
      const delta = now - prev;

      (p.pos || []).forEach((pos) => {
        if (!posMap.has(pos)) {
          posMap.set(pos, { sumCoin: 0, sumDelta: 0, count: 0 });
        }
        const obj = posMap.get(pos);
        obj.sumCoin += now;
        obj.sumDelta += delta;
        obj.count += 1;
      });
    });

    const posCoinData = [];
    const posDeltaData = [];

    Array.from(posMap.entries()).forEach(([pos, v]) => {
      const avgCoin = v.count ? v.sumCoin / v.count : 0;
      const avgDelta = v.count ? v.sumDelta / v.count : 0;
      posCoinData.push({
        pos,
        avgCoin: Number(avgCoin.toFixed(2)),
      });
      posDeltaData.push({
        pos,
        avgDelta: Number(avgDelta.toFixed(2)),
      });
    });

    posCoinData.sort((a, b) => b.avgCoin - a.avgCoin);
    posDeltaData.sort((a, b) => b.avgDelta - a.avgDelta);

    return { posCoinData, posDeltaData };
  }, [players]);

  // ---- 팀 승률 TOP ---------------------------------------------
  const teamWinRateData = useMemo(() => {
    if (!teams || teams.length === 0) return [];

    const list = teams
      .map((t) => {
        const wins = t.wins || 0;
        const losses = t.losses || 0;
        const games = wins + losses;
        const rate = games === 0 ? 0 : (wins / games) * 100;
        return {
          name: t.teamName,
          winRate: Number(rate.toFixed(1)),
          wins,
          losses,
          games,
        };
      })
      .filter((t) => t.games > 0)
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 8);

    return list;
  }, [teams]);

  // ---- 선수 픽률 (teams 기준 등장 횟수) -----------------------
  const pickRateData = useMemo(() => {
    if (!teams || teams.length === 0 || players.length === 0) {
      return { top: [], bottom: [] };
    }

    const counts = {};
    teams.forEach((t) => {
      (t.players || []).forEach((tp) => {
        counts[tp.name] = (counts[tp.name] || 0) + 1;
      });
    });

    const totalTeams = teams.length;
    const all = players.map((p) => {
      const count = counts[p.name] || 0;
      const rate = totalTeams ? (count / totalTeams) * 100 : 0;
      return {
        name: p.name,
        count,
        rate: Number(rate.toFixed(1)),
      };
    });

    const top = [...all]
      .sort((a, b) => b.rate - a.rate || b.count - a.count)
      .slice(0, 10);

    const bottom = [...all]
      .sort((a, b) => a.rate - b.rate || a.count - b.count)
      .slice(0, 10);

    return { top, bottom };
  }, [players, teams]);

  const {
    avgCoinNow,
    avgCoinPrev,
    avgDelta,
    risingCount,
    fallingCount,
    unchangedCount,
    maxRiser,
    maxFaller,
    avgHistoryLen,
  } = summary;

  const kpiNumber = (v, digits = 1) =>
    isNaN(v) ? "-" : Number(v).toFixed(digits);

  return (
    <div>
      {/* 상단 바 & 돌아가기 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>📊 RAON 선수/팀 분석 대시보드</h2>
        <button
          onClick={onBack}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            background: "#555",
            color: "white",
            fontSize: 12,
          }}
        >
          ← 드래프트 화면으로
        </button>
      </div>

      {/* KPI 카드들 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: "#f4f4f4",
            padding: 12,
            borderRadius: 10,
            borderLeft: "4px solid #1976d2",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7 }}>전체 선수 수</div>
          <div style={{ fontSize: 20, fontWeight: "bold" }}>
            {totalPlayers}명
          </div>
        </div>

        <div
          style={{
            background: "#f4f4f4",
            padding: 12,
            borderRadius: 10,
            borderLeft: "4px solid #2e7d32",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7 }}>현재 평균 점수</div>
          <div style={{ fontSize: 20, fontWeight: "bold" }}>
            {kpiNumber(avgCoinNow, 2)}점
          </div>
          <div style={{ fontSize: 11, marginTop: 4 }}>
            직전 대비{" "}
            <span
              style={{
                color: avgDelta > 0 ? "red" : avgDelta < 0 ? "blue" : "#333",
                fontWeight: "bold",
              }}
            >
              {avgDelta > 0 ? "+" : ""}
              {kpiNumber(avgDelta, 2)}
            </span>
          </div>
        </div>

        <div
          style={{
            background: "#f4f4f4",
            padding: 12,
            borderRadius: 10,
            borderLeft: "4px solid #f57c00",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7 }}>상승 / 하락 / 유지</div>
          <div style={{ fontSize: 14, fontWeight: "bold" }}>
            ⬆ {risingCount}명 / ⬇ {fallingCount}명 / ▬ {unchangedCount}명
          </div>
          <div style={{ fontSize: 11, marginTop: 4 }}>
            수치 변동 있는 선수 비율:{" "}
            {totalPlayers
              ? (((risingCount + fallingCount) / totalPlayers) * 100).toFixed(1)
              : "0"}
            %
          </div>
        </div>

        <div
          style={{
            background: "#f4f4f4",
            padding: 12,
            borderRadius: 10,
            borderLeft: "4px solid #8e24aa",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7 }}>평균 history 길이</div>
          <div style={{ fontSize: 20, fontWeight: "bold" }}>
            {kpiNumber(avgHistoryLen, 1)}회
          </div>
          <div style={{ fontSize: 11, marginTop: 4 }}>
            (보이지 않는 손 반영 횟수 느낌)
          </div>
        </div>
      </div>

      {/* 전체 평균 점수 추이 + 팀 승률 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* 전체 평균 점수 히스토리 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: 6,
              fontSize: 14,
            }}
          >
            전체 평균 점수 추이 (history 기준)
          </div>
          <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>
            X축: 보이지 않는 손 반영 / 수동 수정 등으로 history가 쌓인 순서
          </div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={avgHistorySeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avg"
                  name="평균 점수"
                  stroke="#1976d2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 팀 승률 TOP */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: 6,
              fontSize: 14,
            }}
          >
            팀 승률 TOP (랜덤 투표 결과 기준)
          </div>
          <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>
            최소 1경기 이상 (투표 1회 이상) 팀만 포함
          </div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={teamWinRateData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="winRate" name="승률(%)" fill="#2e7d32" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: 11, marginTop: 4 }}>
            {teamWinRateData.length === 0 && "아직 투표 데이터가 부족합니다."}
            {teamWinRateData.length > 0 &&
              teamWinRateData.map((t) => (
                <div key={t.name}>
                  {t.name}: {t.wins}승 {t.losses}패 ({t.winRate}%)
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* 선수 현재 점수 TOP / 상승·하락 TOP */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* 현재 점수 TOP10 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: 6,
              fontSize: 14,
            }}
          >
            현재 점수 TOP 10
          </div>
          <div style={{ width: "100%", height: 230 }}>
            <ResponsiveContainer>
              <BarChart
                data={topCurrentScore}
                layout="vertical"
                margin={{ left: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar dataKey="coin" name="현재 점수" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 상승/하락 TOP */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: 6,
              fontSize: 14,
            }}
          >
            최근 상승 / 하락 TOP
          </div>
          <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold", marginBottom: 4 }}>⬆ 상승</div>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {topRisers.map((d) => (
                  <li key={d.name}>
                    {d.name} (+{d.delta}) → {d.now}
                  </li>
                ))}
                {topRisers.length === 0 && <li>상승한 선수가 아직 없음</li>}
              </ul>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold", marginBottom: 4 }}>⬇ 하락</div>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {topFallers.map((d) => (
                  <li key={d.name}>
                    {d.name} ({d.delta}) → {d.now}
                  </li>
                ))}
                {topFallers.length === 0 && <li>하락한 선수가 아직 없음</li>}
              </ul>
            </div>
          </div>
          <div style={{ fontSize: 11, marginTop: 6 }}>
            가장 많이 오른 선수:{" "}
            {maxRiser ? `${maxRiser.name} (+${maxRiser.delta})` : "-"}
            <br />
            가장 많이 떨어진 선수:{" "}
            {maxFaller ? `${maxFaller.name} (${maxFaller.delta})` : "-"}
          </div>
        </div>
      </div>

      {/* 포지션별 평균 점수 / 평균 변화 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* 포지션별 평균 점수 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: 6,
              fontSize: 14,
            }}
          >
            포지션별 평균 점수
          </div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={posStats.posCoinData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pos" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgCoin" name="평균 점수" fill="#7b1fa2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 포지션별 최근 평균 변화 */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: 6,
              fontSize: 14,
            }}
          >
            포지션별 최근 평균 변화 (직전 vs 현재)
          </div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={posStats.posDeltaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pos" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgDelta" name="평균 변화" fill="#ef6c00" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 선수 픽률 TOP / LOW */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 30,
        }}
      >
        {/* 픽률 TOP */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: 6,
              fontSize: 14,
            }}
          >
            선수 픽률 TOP 10 (팀 등장 기준)
          </div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart
                data={pickRateData.top}
                layout="vertical"
                margin={{ left: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar dataKey="rate" name="픽률(%)" fill="#0097a7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: 11, marginTop: 4 }}>
            (전체 저장된 팀 중 몇 %에서 그 선수가 포함됐는지)
          </div>
        </div>

        {/* 픽률 LOW */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: 6,
              fontSize: 14,
            }}
          >
            잘 안 뽑히는 선수 TOP 10
          </div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12 }}>
            {pickRateData.bottom.map((p) => (
              <li key={p.name}>
                {p.name}: {p.count}팀 ({p.rate}%)
              </li>
            ))}
            {pickRateData.bottom.length === 0 && (
              <li>아직 팀 데이터가 부족합니다.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
