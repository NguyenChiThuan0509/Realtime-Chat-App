import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
    console.log("Lien ket voi CSDL thanh cong!");
  } catch (error) {
    console.log("Loi khi ket noi CSDL:", error);
    process.exit(1); // để dừng chương trình nếu không kết nối được với Database
  }
};
