import bcrypt from "bcryptjs";
import { userRepository } from "@/repositories/user.repository";
import { signToken, verifyToken } from "@/lib/auth";
import { AppError } from "@/lib/errors";

export const authService = {
  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError(401, "Invalid credentials");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new AppError(401, "Invalid credentials");
    const token = signToken({ userId: user.id, role: user.role, email: user.email });
    return { user: { id: user.id, email: user.email, role: user.role }, token };
  },
  async me(token: string | null) {
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload) return null;
    const user = await userRepository.findById(payload.userId);
    if (!user) return null;
    return { id: user.id, email: user.email, role: user.role };
  },
};
