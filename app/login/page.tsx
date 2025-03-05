import Navbar from '@/components/navbar/Navbar';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <LoginForm />
      </div>
    </>
  );
}
