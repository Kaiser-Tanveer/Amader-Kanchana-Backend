import User from "@/models/User";
import { ok, fail } from "@/utils/apiResponse";
import { asyncHandler } from "@/middleware/errorHandler";
import { comparePassword, signToken } from "@/utils/auth";

export const loginHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, isActive: true });
  if (!user) return fail(res, 401, "Invalid email or password.");

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) return fail(res, 401, "Invalid email or password.");

  const token = signToken({ userId: user.id, role: user.role });

  return ok(res, {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});
