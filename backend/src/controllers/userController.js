import User from "../models/User.js";

function formatUserDoc(user) {
  if (!user) return null;
  const o = user.toObject ? user.toObject() : user;
  return {
    _id: o._id.toString(),
    username: o.username,
    email: o.email,
    displayName: o.displayName,
    avatarUrl: o.avatarUrl ?? undefined,
    bio: o.bio ?? undefined,
    phone: o.phone ?? undefined,
    createdAt: o.createdAt?.toISOString?.(),
    updatedAt: o.updatedAt?.toISOString?.(),
  };
}

export const authMe = async (req, res) => {
  try {
    const user = formatUserDoc(req.user);
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Lỗi khi gọi authMe", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const searchByUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username || typeof username !== "string") {
      return res.status(400).json({ message: "Thiếu username" });
    }

    const q = username.trim().toLowerCase();
    const found = await User.findOne({ username: q }).select(
      "-hashedPassword -friends",
    );

    if (!found || found._id.equals(req.user._id)) {
      return res.status(404).json({ message: "Không tìm thấy", user: null });
    }

    return res.json({
      user: {
        _id: found._id.toString(),
        username: found.username,
        displayName: found.displayName,
        avatarUrl: found.avatarUrl ?? null,
      },
    });
  } catch (error) {
    console.error("searchByUsername", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const patchAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không có file" });
    }

    const publicPath = `/uploads/avatars/${req.file.filename}`;
    const base = process.env.SERVER_PUBLIC_URL || `http://localhost:${process.env.PORT || 5001}`;
    const avatarUrl = `${base}${publicPath}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl },
      { new: true },
    ).select("-hashedPassword");

    return res.json({ avatarUrl: user.avatarUrl });
  } catch (error) {
    console.error("patchAvatar", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
