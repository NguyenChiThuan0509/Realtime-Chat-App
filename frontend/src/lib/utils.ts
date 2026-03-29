import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const timeFmt = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
})

const dateTimeFmt = new Intl.DateTimeFormat("vi-VN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

/** Hiển thị giờ hoặc ngày gần đây cho last message / activity trong danh sách chat. */
export function formatOnlineTime(date: Date): string {
  const now = Date.now()
  const t = date.getTime()
  const diffMs = now - t
  if (diffMs < 60_000) return "Vừa xong"
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)} phút`
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)} giờ`
  if (diffMs < 7 * 86_400_000) return `${Math.floor(diffMs / 86_400_000)} ngày`
  return timeFmt.format(date)
}

/** Nhãn thời gian giữa các cụm tin nhắn trong khung chat. */
export function formatMessageTime(date: Date): string {
  const now = new Date()
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  if (sameDay) return timeFmt.format(date)
  return dateTimeFmt.format(date)
}
