// @ts-nocheck

export function normalizeUnreadCounts(unreadCounts) {
  if (!unreadCounts) return {};
  if (unreadCounts instanceof Map) {
    return Object.fromEntries(unreadCounts);
  }
  return { ...unreadCounts };
}

export function formatConversation(c, currentUserId) {
  const participants = (c.participants || []).map((p) => ({
    _id: p._id?.toString?.() ?? String(p._id),
    displayName: p.displayName,
    avatarUrl: p.avatarUrl ?? null,
    joinedAt: (c.createdAt || new Date()).toISOString?.() || new Date().toISOString(),
  }));

  let lastMessage = null;
  if (c.lastMessage && c.lastMessage._id) {
    const lm = c.lastMessage;
    lastMessage = {
      _id: lm._id.toString(),
      content: lm.content ?? "",
      createdAt: lm.createdAt
        ? new Date(lm.createdAt).toISOString()
        : new Date().toISOString(),
      sender: {
        _id: lm.sender?._id?.toString?.() ?? lm.sender?._id,
        displayName: lm.sender?.displayName ?? "",
        avatarUrl: lm.sender?.avatarUrl ?? null,
      },
    };
  }

  const seenBy = (c.seenBy || []).map((s) => ({
    _id: s._id?.toString?.() ?? String(s._id),
    displayName: s.displayName,
    avatarUrl: s.avatarUrl ?? null,
  }));

  return {
    _id: c._id.toString(),
    type: c.type,
    group: {
      name: c.group?.name ?? "",
      createdBy: c.group?.createdBy?.toString?.() ?? "",
    },
    participants,
    lastMessageAt: (c.lastMessageAt ? new Date(c.lastMessageAt) : new Date()).toISOString(),
    seenBy,
    lastMessage,
    unreadCounts: normalizeUnreadCounts(c.unreadCounts),
    createdAt: (c.createdAt ? new Date(c.createdAt) : new Date()).toISOString(),
    updatedAt: (c.updatedAt ? new Date(c.updatedAt) : new Date()).toISOString(),
  };
}

export function formatMessage(m) {
  return {
    _id: m._id.toString(),
    conversationId: m.conversationId.toString(),
    senderId: m.senderId.toString(),
    content: m.content ?? "",
    imgUrl: m.imgUrl ?? null,
    createdAt: (m.createdAt ? new Date(m.createdAt) : new Date()).toISOString(),
    updatedAt: m.updatedAt ? new Date(m.updatedAt).toISOString() : undefined,
  };
}
