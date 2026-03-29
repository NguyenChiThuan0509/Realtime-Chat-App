import { SigninForm } from '@/components/auth/signin-form'

const LoginPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-br from-violet-100 via-white to-fuchsia-100 p-6 md:p-10 dark:from-violet-950 dark:via-background dark:to-fuchsia-950">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SigninForm />
      </div>
    </div>
  )
}

export default LoginPage