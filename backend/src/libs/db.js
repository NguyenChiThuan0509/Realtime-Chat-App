import mongoose from "mongoose";

export const connectDB = async () => {
  const uri =
    process.env.MONGODB_CONNECTIONSTRING || process.env.MONGODB_URI;

  if (!uri?.trim()) {
    console.error(
      "Thiếu MONGODB_CONNECTIONSTRING (hoặc MONGODB_URI) trong file .env",
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Lien ket voi CSDL thanh cong!");
  } catch (error) {
    console.error("Loi khi ket noi CSDL:", error.message);

    if (error.code === "ENOTFOUND" && uri.includes("mongodb+srv")) {
      console.error(`
→ DNS không phân giải được SRV của MongoDB Atlas (querySrv ENOTFOUND).
  Cách xử lý:
  1) Dùng MongoDB cài trên máy (khuyến nghị khi dev): trong .env đặt ví dụ:
     MONGODB_CONNECTIONSTRING=mongodb://127.0.0.1:27017/realtime_chat
  2) Kiểm tra mạng / VPN / DNS (thử đổi DNS 8.8.8.8).
  3) Trên Atlas: cluster còn hoạt động, IP của bạn được whitelist.
  4) Trong Atlas → Connect → thử chuỗi "Standard connection" (mongodb://...)
     nếu SRV bị chặn trên mạng của bạn.`);
    }

    process.exit(1);
  }
};
