export function applyInvisibleHand(players, pickedNames) {
  return players.map((p) => {
    const wasPicked = pickedNames.includes(p.name);

    const newTrend = [...(p.trend || []), wasPicked ? 1 : 0];
    while (newTrend.length > 6) newTrend.shift(); // 6번 기준으로 변경 가능

    const pickedCount = newTrend.reduce((a, b) => a + b, 0);

    let delta = 0;
    if (pickedCount === 0) delta = -1;
    else if (pickedCount === 4) delta = 1;
    else if (pickedCount >= 5) delta = 2;

    let newCoin = p.coin + delta;
    if (newCoin < 0) newCoin = 0;
    if (newCoin > 100) newCoin = 100;

    return {
      ...p,
      coin: newCoin,
      trend: newTrend,
      history: [...p.history, newCoin],
    };
  });
}
