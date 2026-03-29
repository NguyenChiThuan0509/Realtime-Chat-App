import * as z from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    lastName: z.string().min(1, "Họ không được để trống"),
    firstName: z.string().min(1, "Tên không được để trống"),
    username: z.string().min(3, "Tên đăng nhập ít nhất 3 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

export type SignupFormValues = z.infer<typeof signupSchema>
