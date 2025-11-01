import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import ResetPasswordForm from "@/components/features/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ResetPasswordForm />
    </QueryClientProvider>
  );
}
