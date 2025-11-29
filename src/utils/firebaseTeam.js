import {
  addDoc,
  collection,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// -------------------------------
// 팀 저장 함수
// -------------------------------
export async function saveTeamToDB(db, players, teamName, creator) {
  const total = players.reduce((s, p) => s + p.coin, 0);

  await addDoc(collection(db, "teams"), {
    teamName,
    creator,
    players,
    total,
    wins: 0,
    losses: 0,
    createdAt: serverTimestamp(),
  });
}

// -------------------------------
// 투표 저장 함수 (★ 여기 없어서 에러 발생한 것)
// -------------------------------
export async function saveVote(db, poll, winner, loser) {
  // 투표 기록 저장
  await addDoc(collection(db, "pollVotes"), {
    teamA: poll.teamA.teamName,
    teamB: poll.teamB.teamName,
    winnerName: winner.teamName,
    loserName: loser.teamName,
    createdAt: serverTimestamp(),
  });

  // winner 정보 증가
  if (winner.id) {
    await updateDoc(doc(db, "teams", winner.id), {
      wins: (winner.wins || 0) + 1,
    });
  }

  // loser 정보 증가
  if (loser.id) {
    await updateDoc(doc(db, "teams", loser.id), {
      losses: (loser.losses || 0) + 1,
    });
  }
}
