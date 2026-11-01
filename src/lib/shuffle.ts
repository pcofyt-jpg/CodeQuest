/**
 * Порядок вариантов ответа на экране.
 * В тексте уроков правильный ответ часто записан первым — ребёнок не должен этого замечать.
 * Порядок постоянный для каждого вопроса (не прыгает при обновлении) и никогда не совпадает с исходным.
 */
function hash(text: string): number {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.codePointAt(0)!, 16777619);
  return h >>> 0;
}

export function optionOrder(key: string, n: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  let s = hash(key) || 1;
  for (let i = n - 1; i > 0; i--) {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    const j = s % (i + 1);
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  if (n > 1 && order.every((v, i) => v === i)) order.push(order.shift()!);
  return order;
}
