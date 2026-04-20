const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeRooms, buildTrainingPlan } = require("../tryhackme");

test("normalizeRooms keeps valid room objects", () => {
  const rooms = normalizeRooms([
    { code: "room1", title: "Intro Web", type: "walkthrough", creator: "alice" },
    { code: "", title: "Invalid" },
    null,
  ]);

  assert.equal(rooms.length, 1);
  assert.deepEqual(rooms[0], {
    code: "room1",
    title: "Intro Web",
    type: "walkthrough",
    creator: "alice",
  });
});

test("buildTrainingPlan returns readable fallback for empty set", () => {
  const plan = buildTrainingPlan([]);
  assert.equal(plan, "No training rooms available from API response.");
});
