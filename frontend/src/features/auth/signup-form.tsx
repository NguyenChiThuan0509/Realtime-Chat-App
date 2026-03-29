import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema, type SignupFormValues } from "./auth-schema"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      lastName: "",
      firstName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = (data: SignupFormValues) => {
    console.log("Signup data:", data)
    // Handle signup logic here
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-2xl shadow-violet-500/10 dark:shadow-violet-900/20 border-muted/30">
        <CardContent className="grid p-0 md:min-h-[500px] md:grid-cols-2">
          <form
            className="p-6 md:p-8 flex flex-col justify-center"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  Chào mừng bạn! Hãy đăng ký để bắt đầu.
                </p>
              </div>
              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="lastName">Họ</FieldLabel>
                  <Input
                    id="lastName"
                    placeholder="Nguyễn"
                    {...register("lastName")}
                    aria-invalid={!!errors.lastName}
                  />
                  <FieldError errors={[errors.lastName]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="firstName">Tên</FieldLabel>
                  <Input
                    id="firstName"
                    placeholder="Thành"
                    {...register("firstName")}
                    aria-invalid={!!errors.firstName}
                  />
                  <FieldError errors={[errors.firstName]} />
                </Field>
              </Field>

              <Field>
                <FieldLabel htmlFor="username">Tên đăng nhập</FieldLabel>
                <Input
                  id="username"
                  placeholder="nguyenthanh"
                  {...register("username")}
                  aria-invalid={!!errors.username}
                />
                <FieldError errors={[errors.username]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                <FieldError errors={[errors.email]} />
              </Field>

              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      {...register("password")}
                      aria-invalid={!!errors.password}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Xác nhận mật khẩu
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      {...register("confirmPassword")}
                      aria-invalid={!!errors.confirmPassword}
                    />
                  </Field>
                </Field>
                <FieldError errors={[errors.password, errors.confirmPassword]} />
                {!errors.password && !errors.confirmPassword && (
                  <FieldDescription>Tối thiểu phải có 8 ký tự.</FieldDescription>
                )}
              </Field>

              <Field>
                <Button type="submit">Đăng ký</Button>
              </Field>

              <FieldDescription className="text-center">
                Đã có tài khoản? <a href="/">Đăng nhập</a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholder.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-4 text-center">
        Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a> và{" "}
        <a href="#">Chính sách bảo mật</a> của chúng tôi.
      </FieldDescription>
    </div>
  )
}
