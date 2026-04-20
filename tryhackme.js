const DEFAULT_TRYHACKME_NEW_ROOMS_URL =
  process.env.TRYHACKME_API_NEW_ROOMS_URL || "https://tryhackme.com/api/new-rooms";

function normalizeRooms(payload) {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .filter((room) => room && typeof room === "object")
    .map((room) => ({
      code: String(room.code || "").trim(),
      title: String(room.title || "Untitled room").trim(),
      type: String(room.type || "unknown").trim(),
      creator: String(room.creator || "unknown").trim(),
    }))
    .filter((room) => room.code.length > 0);
}

async function fetchNewRooms(fetchImpl = fetch, url = DEFAULT_TRYHACKME_NEW_ROOMS_URL) {
  const response = await fetchImpl(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent": "BugBountyPro-Training/2.0",
    },
  });

  if (!response.ok) {
    throw new Error(`TryHackMe API request failed (${response.status})`);
  }

  const payload = await response.json();
  return normalizeRooms(payload);
}

function buildTrainingPlan(rooms, maxRooms = 5) {
  const selected = rooms.slice(0, maxRooms);
  if (selected.length === 0) {
    return "No training rooms available from API response.";
  }

  const lines = ["TryHackMe training shortlist:"];
  selected.forEach((room, index) => {
    lines.push(
      `${index + 1}. ${room.title} (${room.type}) — code: ${room.code} — by ${room.creator}`
    );
  });

  return lines.join("\n");
}

module.exports = {
  DEFAULT_TRYHACKME_NEW_ROOMS_URL,
  normalizeRooms,
  fetchNewRooms,
  buildTrainingPlan,
};
