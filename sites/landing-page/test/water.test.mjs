import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// main.js is browser-bound. Extract the pure simulation cores and evaluate
// them in isolation (same pattern as pompui.de punctum tests).
const code = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "js", "main.js"),
    "utf8"
);

function extract(name) {
    const re = new RegExp(`const ${name} = (\\{[\\s\\S]*?\\n\\});`);
    const m = code.match(re);
    if (!m) throw new Error(`${name} not found in main.js`);
    return eval(`(${m[1]})`);
}

const WaterSim = extract("WaterSim");
const BodySim = extract("BodySim");

/* ---------------- WaterSim ---------------- */

function mk(rows = 5, cols = 8) { return WaterSim.create(rows, cols); }

test("water: create makes empty grid of right size", () => {
    const s = mk();
    assert.equal(s.rows, 5);
    assert.equal(s.cols, 8);
    assert.equal(s.grid.length, 40);
    assert.equal(s.grid.every(v => v === 0), true);
});

test("water: pour fills a circular blob in bounds", () => {
    const s = mk();
    WaterSim.pour(s, 2, 2, 1);
    assert.equal(WaterSim.at(s, 2, 2), 1);
    assert.equal(WaterSim.at(s, 1, 2), 1);
    assert.equal(WaterSim.at(s, 3, 3), 0);        // outside r=1 circle
    WaterSim.pour(s, 0, 0, 2);                    // overfill is clamped
    assert.equal(WaterSim.at(s, -1, 0), 1);       // border reads as wall
    assert.equal(WaterSim.at(s, 0, 0), 1);
});

test("water: single cell falls straight down", () => {
    const s = mk(5, 5);
    WaterSim.set(s, 2, 1, 1);
    WaterSim.step(s);
    assert.equal(WaterSim.at(s, 2, 1), 0);
    assert.equal(WaterSim.at(s, 2, 2), 1);
});

test("water: falls to the floor over multiple steps", () => {
    const s = mk(5, 5);
    WaterSim.set(s, 2, 0, 1);
    for (let i = 0; i < 6; i++) WaterSim.step(s);
    assert.equal(WaterSim.at(s, 2, 4), 1);        // resting on the bottom border
    assert.equal(WaterSim.step(s) >= 0, true);    // stable, no crash
});

test("water: piles up when the floor is blocked", () => {
    const s = mk(4, 4);
    // wall of water across the bottom
    for (let x = 0; x < 4; x++) WaterSim.set(s, x, 3, 1);
    // drop one more cell in the middle
    WaterSim.set(s, 2, 0, 1);
    WaterSim.step(s);                              // falls to y=1
    WaterSim.step(s);                              // falls to y=2 (floor y=3 is water)
    assert.equal(WaterSim.at(s, 2, 2), 1);
    WaterSim.step(s);
    // cannot pass through row 3 water: mass is conserved and floor stays full
    const total = s.grid.reduce((a, v) => a + v, 0);
    assert.equal(total, 5);
    for (let x = 0; x < 4; x++) assert.equal(WaterSim.at(s, x, 3), 1);
});

test("water: spreads sideways toward an opening", () => {
    const s = mk(4, 5);
    // floor water with a hole at column 4 (col 4 is water at y=3, nothing below)
    for (let x = 0; x < 4; x++) WaterSim.set(s, x, 3, 1);
    WaterSim.set(s, 3, 2, 1);                      // cell above the pile near edge
    // give it a fall target: (4,4) is border… use wider sim: col 4 stays open
    // make a true opening: remove floor water at x=4
    WaterSim.set(s, 4, 3, 0);
    // after some steps the cell must have moved towards/right into the gap
    let spread = false;
    for (let i = 0; i < 6; i++) {
        WaterSim.step(s);
        if (WaterSim.at(s, 3, 2) === 0 || WaterSim.at(s, 4, 3) === 1) spread = true;
    }
    assert.equal(spread, true);
});

test("water: full basin is stable — no endless motion", () => {
    const s = mk(4, 5);
    for (let x = 0; x < 5; x++) WaterSim.set(s, x, 3, 1);   // full floor
    WaterSim.set(s, 2, 2, 1);                               // cell on top
    let moves = 0;
    for (let i = 0; i < 12; i++) moves += WaterSim.step(s);
    assert.equal(moves, 0);                        // contained water rests
});

test("water: conservation — total mass never grows", () => {
    const s = mk(6, 6);
    WaterSim.pour(s, 3, 1, 2);
    const before = s.grid.reduce((a, v) => a + v, 0);
    for (let i = 0; i < 12; i++) WaterSim.step(s);
    const after = s.grid.reduce((a, v) => a + v, 0);
    assert.equal(after, before);
    assert.equal(after, 12);                       // r=2 circle clipped at top border
});

test("water: step counts moves and reaches 0 when settled", () => {
    const s = mk(6, 6);
    WaterSim.pour(s, 3, 0, 1);
    let moves = 0;
    for (let i = 0; i < 30; i++) moves += WaterSim.step(s);
    assert.equal(moves > 0, true);                 // water actually fell
    assert.equal(WaterSim.step(s), 0);             // settled — no motion left
});

test("water: stir pushes cells radially away from the cursor", () => {
    const s = mk(5, 8);
    // blocked floor + two water cells
    for (let x = 0; x < 8; x++) WaterSim.set(s, x, 4, 1);
    WaterSim.set(s, 2, 3, 1);                      // left of cursor
    WaterSim.set(s, 4, 3, 1);                      // right of cursor
    WaterSim.stir(s, 3, 3, 1);
    // radial push: left cell (dx=-1) goes 2 left, right cell (dx=+1) goes 2 right
    assert.equal(WaterSim.at(s, 0, 3), 1);         // 2 -> 0
    assert.equal(WaterSim.at(s, 6, 3), 1);         // 4 -> 6
    assert.equal(WaterSim.at(s, 2, 3), 0);
});

/* ---------------- BodySim ---------------- */

function body(over = {}) {
    return {
        x: 100, y: 0, w: 40, h: 20,
        vx: 0, vy: 0, r: 0, vr: 0,
        inWater: false,
        ...over
    };
}

test("body: gravity accelerates downward", () => {
    const b = body();
    const world = { width: 400, height: 300 };
    BodySim.step(b, world);
    assert.equal(b.vy > 0, true);
    const v1 = b.vy;
    BodySim.step(b, world);
    assert.equal(b.vy > v1, true);
});

test("body: lands on the floor and settles", () => {
    const b = body({ y: 1000 });
    const world = { width: 400, height: 300 };
    BodySim.step(b, world);
    assert.equal(b.y, 280);                        // height - body.h
    assert.equal(b.vy < 0, true);                  // bounced up
    for (let i = 0; i < 60; i++) BodySim.step(b, world);
    assert.equal(Math.abs(b.y - 280) < 1, true);
    assert.equal(Math.abs(b.vy) < 0.5, true);
});

test("body: clamps at left/right walls", () => {
    const b = body({ x: -50, vx: -5 });
    BodySim.step(b, { width: 400, height: 300 });
    assert.equal(b.x >= 0, true);
    assert.equal(b.vx > 0, true);                  // bounced
    const b2 = body({ x: 500, vx: 5 });
    BodySim.step(b2, { width: 400, height: 300 });
    assert.equal(b2.x, 360);                       // width - w
    assert.equal(b2.vx < 0, true);
});

test("body: buoyancy slows fall in water", () => {
    const dry = body({ inWater: false });
    const wet = body({ inWater: true });
    const world = { width: 400, height: 300 };
    BodySim.step(wet, world);
    BodySim.step(dry, world);
    assert.equal(wet.vy < dry.vy, true);
});

test("body: waterKick only fires when touching water", () => {
    const s = WaterSim.create(10, 10);
    WaterSim.pour(s, 5, 8, 2);                     // water at bottom-center
    const touching = body({ x: 30, y: 52, w: 30, h: 20 });
    const elsewhere = body({ x: 0, y: 0, w: 30, h: 20 });
    assert.equal(BodySim.waterKick(touching, s, 8), true);
    assert.equal(BodySim.waterKick(elsewhere, s, 8), false);
    assert.equal(touching.vy < 0, true);           // got kicked up
});

test("body: rotation integrates and damps in water", () => {
    const b = body({ inWater: true, vr: 3, r: 0 });
    BodySim.step(b, { width: 400, height: 300 });
    assert.equal(b.r > 0, true);
    const wetR = b.vr;
    BodySim.step(b, { width: 400, height: 300 });
    assert.equal(b.vr < wetR, true);               // damped
});

/* ---------------- regression: the two user-reported bugs ---------------- */

test("regression: dropped sticker must NOT be pulled back to its board slot", () => {
    // The fix: 'up' handler must not remove .free / reset position.
    // Assert the intent structurally: up() leaves the free class on.
    const src = code;
    const upFn = src.match(/function up\(ev\) \{[\s\S]*?\n    \}/);
    assert.notEqual(upFn, null, "sticker up() handler exists");
    assert.equal(upFn[0].includes('removeChild'), false);
    assert.equal(upFn[0].includes('classList.remove("free")'), false,
        "up() must keep the sticker free-floating (no snap back)");
    assert.equal(upFn[0].includes('classList.add("free")'), true);
});

test("regression: pour button toggles pour mode on and off", () => {
    // setMode("drop") when already in drop mode must switch OFF (mode stays
    // usable: toolbar is a toggle, not a no-op).
    const setModeSrc = code.match(/function setMode\(m\) \{[\s\S]*?\n    \}/);
    assert.notEqual(setModeSrc, null, "setMode exists");
    // structural check: drop toggle flips mode back to null/none when re-clicked
    assert.equal(setModeSrc[0].includes('mode = (mode === m)'), true,
        "setMode toggles off when the active mode is clicked again");
});