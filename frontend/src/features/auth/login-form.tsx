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
import { loginSchema, type LoginFormValues } from "./auth-schema"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (data: LoginFormValues) => {
    console.log("Login data:", data)
    // Handle login logic here
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
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground text-sm">
                  Đăng nhập vào tài khoản của bạn
                </p>
              </div>
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
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                <FieldError errors={[errors.password]} />
              </Field>
              <Field>
                <Button type="submit">Đăng nhập</Button>
              </Field>

              <FieldDescription className="text-center">
                Chưa có tài khoản? <a href="/register">Đăng ký</a>
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
    </div>
  )
}
