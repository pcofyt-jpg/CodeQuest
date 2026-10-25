#!/usr/bin/env node
/**
 * Коды доступа к ИИ-наставнику для семей пилота.
 *
 *   node scripts/mentor-codes.mjs 3          — придумать 3 новых кода
 *   node scripts/mentor-codes.mjs "мой-код"  — посчитать SHA-256 для своего кода
 *
 * Коды раздайте семьям, а в настройки функции (ACCESS_CODES_SHA256) вставьте только хеши.
 * Чтобы отключить семью — уберите её хеш из списка.
 */
import { createHash, randomInt } from "node:crypto";

const WORDS = ["kot", "raketa", "kod", "zvezda", "robot", "kosmos", "drakon", "piksel", "kometa", "planeta", "sova", "start"];
const hash = (code) => createHash("sha256").update(code.trim().toLowerCase(), "utf8").digest("hex");
const arg = process.argv[2];

if (!arg) {
  console.log('Использование: node scripts/mentor-codes.mjs 3   или   node scripts/mentor-codes.mjs "свой-код"');
  process.exit(1);
}

if (/^\d+$/.test(arg)) {
  const codes = Array.from({ length: Math.min(Number(arg), 50) }, () =>
    [WORDS[randomInt(WORDS.length)], WORDS[randomInt(WORDS.length)], randomInt(100, 1000)].join("-"),
  );
  console.log("Коды для семей (раздайте лично, не публикуйте):");
  codes.forEach((c) => console.log("  " + c));
  console.log("\nЗначение для ACCESS_CODES_SHA256 (вставьте в настройки функции):");
  console.log(codes.map(hash).join(","));
} else {
  console.log(hash(arg));
}
