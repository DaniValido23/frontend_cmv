import { useEffect, useState } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { navigateTo } from "@/hooks/useNavigate";
import PreConsultationForm from '@/components/features/pre-consultation/PreConsultationForm';

export default function PreConsultationPage() {
  const { isAuthenticated, initAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();

    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigateTo("/login");
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PreConsultationForm />
    </QueryClientProvider>
  );
}
