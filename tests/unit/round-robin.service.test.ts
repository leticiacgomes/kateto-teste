import { describe, expect, it } from "vitest";
import { roundRobinService } from "../../src/services/round-robin.service";

describe("roundRobinService.computeNextIndex", () => {
  it("avança pro próximo índice dentro da fila", () => {
    expect(roundRobinService.computeNextIndex(0, 5)).toBe(1);
    expect(roundRobinService.computeNextIndex(1, 5)).toBe(2);
    expect(roundRobinService.computeNextIndex(2, 5)).toBe(3);
    expect(roundRobinService.computeNextIndex(3, 5)).toBe(4);
  });

  it("dá a volta pro início ao passar do último vendedor (Leonardo -> Marcelo)", () => {
    expect(roundRobinService.computeNextIndex(4, 5)).toBe(0);
  });

  it("com um único representative, sempre volta pro mesmo índice", () => {
    expect(roundRobinService.computeNextIndex(0, 1)).toBe(0);
  });
});
