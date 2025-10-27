import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface DashboardStats {
  consultations_today: number;
  patients_in_waiting_room: number;
  revenue_today: number;
}

interface ConsultationData {
  date: string;
  consultations: number;
}

interface ConsultationsAnalytics {
  daily_consultations: ConsultationData[] | null;
  weekly_consultations: any[] | null;
  monthly_consultations: any[] | null;
  yearly_consultations: any[] | null;
  total_consultations: number;
  avg_consultations: number;
  group_by: string;
  period_start: string;
  period_end: string;
}

interface RevenueData {
  date: string;
  revenue: number;
  consultations: number;
}

interface RevenueAnalytics {
  daily_revenue: RevenueData[] | null;
  weekly_revenue: any[] | null;
  monthly_revenue: any[] | null;
  yearly_revenue: any[] | null;
  total_revenue: number;
  avg_revenue: number;
  group_by: string;
  period_start: string;
  period_end: string;
}

interface WeightRecord {
  date: string;
  weight: number;
  height: number;
  imc: number;
  pre_consultation_id: string;
}

interface WeightHistory {
  patient_id: string;
  patient_name: string;
  weight_records: WeightRecord[];
  initial_weight: number;
  current_weight: number;
  weight_change: number;
  initial_imc: number;
  current_imc: number;
  imc_change: number;
  records_count: number;
}

export function useDashboardStats(doctorId?: string) {
  return useQuery({
    queryKey: ["dashboard-stats", doctorId],
    queryFn: async () => {
      let url = "/analytics/dashboard";
      if (doctorId) {
        url += `?doctor_id=${doctorId}`;
      }
      const response = await api.get(url);
      return response.data.data as DashboardStats;
    },
    refetchInterval: 120000, // Auto-refresh every 2 minutes
  });
}

export function useConsultationsAnalytics(groupBy: 'day' | 'week' | 'month' | 'year' = 'day') {
  return useQuery({
    queryKey: ["consultations-analytics", groupBy],
    queryFn: async () => {
      const response = await api.get(`/analytics/consultations?group_by=${groupBy}`);
      return response.data.data as ConsultationsAnalytics;
    },
  });
}

export function useRevenueAnalytics(groupBy: 'day' | 'week' | 'month' | 'year' = 'day') {
  return useQuery({
    queryKey: ["revenue-analytics", groupBy],
    queryFn: async () => {
      const response = await api.get(`/analytics/revenue?group_by=${groupBy}`);
      return response.data.data as RevenueAnalytics;
    },
  });
}

export function usePatientWeightHistory(patientId: string | null) {
  return useQuery({
    queryKey: ["patient-weight-history", patientId],
    queryFn: async () => {
      if (!patientId) return null;
      const response = await api.get(`/analytics/patients/${patientId}/weight-history`);
      return response.data.data as WeightHistory;
    },
    enabled: !!patientId,
  });
}

export function useTotalStats() {
  return useQuery({
    queryKey: ["total-stats"],
    queryFn: async () => {
      // Hacer peticiones en paralelo para consultas e ingresos con rango amplio
      const [consultationsRes, revenueRes] = await Promise.all([
        api.get("/analytics/consultations?from=2020-01-01&to=2099-12-31&group_by=year"),
        api.get("/analytics/revenue?from=2020-01-01&to=2099-12-31&group_by=year"),
      ]);

      return {
        total_consultations: consultationsRes.data.data.total_consultations,
        total_revenue: revenueRes.data.data.total_revenue,
      };
    },
  });
}

interface TopPatient {
  patient_id: string;
  patient_name: string;
  total_consultations: number;
  last_consultation: string;
}

interface TopPatientsResponse {
  patients: TopPatient[];
  total_patients: number;
}

export function useTopPatients() {
  return useQuery({
    queryKey: ["top-patients"],
    queryFn: async () => {
      const response = await api.get("/analytics/patients");
      return response.data.data as TopPatientsResponse;
    },
  });
}
