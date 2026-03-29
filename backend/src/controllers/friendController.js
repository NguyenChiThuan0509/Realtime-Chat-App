// @ts-nocheck
import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

const miniUser = (u) => ({
  _id: u._id.toString(),
  username: u.username,
  displayName: u.displayName,
  avatarUrl: u.avatarUrl ?? null,
});

export const sendFriendRequest = async (req, res) => {
  try {
    const { to, message = "" } = req.body;
    const fromId = req.user._id;

    if (!to) {
      return res.status(400).json({ message: "Thiếu người nhận" });
    }
    if (to === fromId.toString()) {
      return res.status(400).json({ message: "Không thể kết bạn với chính mình" });
    }

    const target = await User.findById(to);
    if (!target) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const me = await User.findById(fromId);
    if (me.friends?.some((id) => id.toString() === to)) {
      return res.status(400).json({ message: "Đã là bạn" });
    }

    const pending = await FriendRequest.findOne({
      from: fromId,
      to,
      status: "pending",
    });
    if (pending) {
      return res.status(409).json({ message: "Đã gửi lời mời trước đó" });
    }

    const reverse = await FriendRequest.findOne({
      from: to,
      to: fromId,
      status: "pending",
    });
    if (reverse) {
      return res.status(409).json({ message: "Người này đã gửi lời mời cho bạn — hãy chấp nhận trong danh sách" });
    }

    await FriendRequest.create({
      from: fromId,
      to,
      message,
      status: "pending",
    });

    return res.status(201).json({ message: "Đã gửi lời mời kết bạn" });
  } catch (error) {
    console.error("sendFriendRequest", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const listFriendRequests = async (req, res) => {
  try {
    const uid = req.user._id;

    const sent = await FriendRequest.find({ from: uid, status: "pending" })
      .populate("to", "username displayName avatarUrl")
      .sort({ createdAt: -1 })
      .lean();

    const received = await FriendRequest.find({ to: uid, status: "pending" })
      .populate("from", "username displayName avatarUrl")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      sent: sent.map((r) => ({
        _id: r._id.toString(),
        to: miniUser(r.to),
        message: r.message,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      received: received.map((r) => ({
        _id: r._id.toString(),
        from: miniUser(r.from),
        message: r.message,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("listFriendRequests", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const uid = req.user._id;

    const reqDoc = await FriendRequest.findOne({
      _id: requestId,
      to: uid,
      status: "pending",
    });

    if (!reqDoc) {
      return res.status(404).json({ message: "Không tìm thấy lời mời" });
    }

    const fromId = reqDoc.from;
    const toId = reqDoc.to;

    await User.updateOne({ _id: fromId }, { $addToSet: { friends: toId } });
    await User.updateOne({ _id: toId }, { $addToSet: { friends: fromId } });

    reqDoc.status = "accepted";
    await reqDoc.save();

    return res.json({ requestAcceptedBy: uid.toString() });
  } catch (error) {
    console.error("acceptRequest", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const declineRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const uid = req.user._id;

    const reqDoc = await FriendRequest.findOne({
      _id: requestId,
      to: uid,
      status: "pending",
    });

    if (!reqDoc) {
      return res.status(404).json({ message: "Không tìm thấy lời mời" });
    }

    reqDoc.status = "declined";
    await reqDoc.save();

    return res.sendStatus(204);
  } catch (error) {
    console.error("declineRequest", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const listFriends = async (req, res) => {
  try {
    const me = await User.findById(req.user._id).populate(
      "friends",
      "username displayName avatarUrl",
    );

    const friends = (me.friends || []).map((f) => ({
      _id: f._id.toString(),
      username: f.username,
      displayName: f.displayName,
      avatarUrl: f.avatarUrl ?? null,
    }));

    return res.json({ friends });
  } catch (error) {
    console.error("listFriends", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
