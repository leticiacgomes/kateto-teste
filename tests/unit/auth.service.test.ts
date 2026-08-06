import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/repositories/user.repository", () => ({
  userRepository: { findByEmail: vi.fn() },
}));

import { userRepository } from "@/repositories/user.repository";
import { authService } from "@/services/auth.service";

const findByEmailMock = vi.mocked(userRepository.findByEmail);

beforeEach(() => {
  findByEmailMock.mockReset();
});

describe("authService.verifyCredentials", () => {
  it("retorna o usuário (sem passwordHash) quando a senha bate", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 10);
    findByEmailMock.mockResolvedValueOnce({
      id: "user-1",
      email: "admin@dropbase.com",
      name: "Admin",
      passwordHash,
      createdAt: new Date(),
    });

    const result = await authService.verifyCredentials(
      "admin@dropbase.com",
      "correct-password",
    );

    expect(result).toEqual({
      id: "user-1",
      email: "admin@dropbase.com",
      name: "Admin",
    });
  });

  it("retorna null quando a senha não bate", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 10);
    findByEmailMock.mockResolvedValueOnce({
      id: "user-1",
      email: "admin@dropbase.com",
      name: "Admin",
      passwordHash,
      createdAt: new Date(),
    });

    const result = await authService.verifyCredentials(
      "admin@dropbase.com",
      "wrong-password",
    );

    expect(result).toBeNull();
  });

  it("retorna null quando o e-mail não existe", async () => {
    findByEmailMock.mockResolvedValueOnce(null);

    const result = await authService.verifyCredentials(
      "ninguem@dropbase.com",
      "qualquer-senha",
    );

    expect(result).toBeNull();
    expect(findByEmailMock).toHaveBeenCalledWith(
      expect.anything(),
      "ninguem@dropbase.com",
    );
  });
});
