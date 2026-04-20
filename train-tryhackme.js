#!/usr/bin/env node
const { fetchNewRooms, buildTrainingPlan } = require("./tryhackme");

async function main() {
  const maxRooms = Number(process.env.TRYHACKME_MAX_ROOMS || 5);
  const rooms = await fetchNewRooms();
  console.log(buildTrainingPlan(rooms, Number.isFinite(maxRooms) ? maxRooms : 5));
  console.log("\nUse rooms only as legal practice environments.");
}

main().catch((error) => {
  console.error(`Training bootstrap failed: ${error.message}`);
  process.exit(1);
});
