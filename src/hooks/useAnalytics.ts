import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QUERY_STALE_TIME } from "@/lib/queryClient";

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
  weekly_consultations: ConsultationData[] | null;
  monthly_consultations: ConsultationData[] | null;
  yearly_consultations: ConsultationData[] | null;
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
  weekly_revenue: RevenueData[] | null;
  monthly_revenue: RevenueData[] | null;
  yearly_revenue: RevenueData[] | null;
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
    staleTime: QUERY_STALE_TIME.REALTIME,
    refetchInterval: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useConsultationsAnalytics(groupBy: 'day' | 'week' | 'month' | 'year' = 'day') {
  return useQuery({
    queryKey: ["consultations-analytics", groupBy],
    queryFn: async () => {
      const response = await api.get(`/analytics/consultations?group_by=${groupBy}`);
      return response.data.data as ConsultationsAnalytics;
    },
    staleTime: QUERY_STALE_TIME.MEDIUM,
  });
}

export function useRevenueAnalytics(groupBy: 'day' | 'week' | 'month' | 'year' = 'day') {
  return useQuery({
    queryKey: ["revenue-analytics", groupBy],
    queryFn: async () => {
      const response = await api.get(`/analytics/revenue?group_by=${groupBy}`);
      return response.data.data as RevenueAnalytics;
    },
    staleTime: QUERY_STALE_TIME.MEDIUM,
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
    staleTime: QUERY_STALE_TIME.SHORT,
  });
}

export function useTotalStats() {
  return useQuery({
    queryKey: ["total-stats"],
    queryFn: async () => {

      const [consultationsRes, revenueRes] = await Promise.all([
        api.get("/analytics/consultations?from=2020-01-01&to=2099-12-31&group_by=year"),
        api.get("/analytics/revenue?from=2020-01-01&to=2099-12-31&group_by=year"),
      ]);

      return {
        total_consultations: consultationsRes.data.data.total_consultations,
        total_revenue: revenueRes.data.data.total_revenue,
      };
    },
    staleTime: QUERY_STALE_TIME.MEDIUM,
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

interface TopSymptomItem {
  symptom: string;
  count: number;
  percentage: number;
}

interface TopSymptomsResponse {
  symptoms: TopSymptomItem[];
  total: number;
  period_start: string;
  period_end: string;
}

interface TopDiagnosisItem {
  diagnosis: string;
  count: number;
  percentage: number;
}

interface TopDiagnosesResponse {
  diagnoses: TopDiagnosisItem[];
  total: number;
  period_start: string;
  period_end: string;
}

interface TopMedicationItem {
  medication: string;
  count: number;
  percentage: number;
}

interface TopMedicationsResponse {
  medications: TopMedicationItem[];
  total: number;
  period_start: string;
  period_end: string;
}

interface GlucoseRecord {
  date: string;
  blood_glucose: number;
  pre_consultation_id: string;
}

interface GlucoseHistory {
  patient_id: string;
  patient_name: string;
  glucose_records: GlucoseRecord[];
  initial_glucose: number;
  current_glucose: number;
  glucose_change: number;
  average_glucose: number;
  records_count: number;
}

interface BloodPressureRecord {
  date: string;
  systolic_pressure: number;
  diastolic_pressure: number;
  pre_consultation_id: string;
}

interface BloodPressureHistory {
  patient_id: string;
  patient_name: string;
  blood_pressure_records: BloodPressureRecord[];
  initial_systolic: number;
  current_systolic: number;
  systolic_change: number;
  average_systolic: number;
  initial_diastolic: number;
  current_diastolic: number;
  diastolic_change: number;
  average_diastolic: number;
  records_count: number;
}

interface GenderStatsResponse {
  male_count: number;
  female_count: number;
  total_count: number;
}

export function useTopPatients() {
  return useQuery({
    queryKey: ["top-patients"],
    queryFn: async () => {
      const response = await api.get("/analytics/patients");
      return response.data.data as TopPatientsResponse;
    },
    staleTime: QUERY_STALE_TIME.MEDIUM,
  });
}

export function useTopSymptoms(limit: number = 10, from?: string, to?: string) {
  return useQuery({
    queryKey: ["top-symptoms", limit, from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      const response = await api.get(`/analytics/top-symptoms?${params.toString()}`);
      return response.data.data as TopSymptomsResponse;
    },
    staleTime: QUERY_STALE_TIME.MEDIUM,
  });
}

export function useTopDiagnoses(limit: number = 10, from?: string, to?: string) {
  return useQuery({
    queryKey: ["top-diagnoses", limit, from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      const response = await api.get(`/analytics/top-diagnoses?${params.toString()}`);
      return response.data.data as TopDiagnosesResponse;
    },
    staleTime: QUERY_STALE_TIME.MEDIUM,
  });
}

export function useTopMedications(limit: number = 10, from?: string, to?: string) {
  return useQuery({
    queryKey: ["top-medications", limit, from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      const response = await api.get(`/analytics/top-medications?${params.toString()}`);
      return response.data.data as TopMedicationsResponse;
    },
    staleTime: QUERY_STALE_TIME.MEDIUM,
  });
}

export function useGlucoseHistory(patientId: string | null, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["glucose-history", patientId, startDate, endDate],
    queryFn: async () => {
      if (!patientId) return null;

      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const queryString = params.toString();
      const url = `/analytics/patients/${patientId}/glucose-history${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      return response.data.data as GlucoseHistory;
    },
    enabled: !!patientId,
    staleTime: QUERY_STALE_TIME.SHORT,
  });
}

export function useBloodPressureHistory(patientId: string | null, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["blood-pressure-history", patientId, startDate, endDate],
    queryFn: async () => {
      if (!patientId) return null;

      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const queryString = params.toString();
      const url = `/analytics/patients/${patientId}/blood-pressure-history${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      return response.data.data as BloodPressureHistory;
    },
    enabled: !!patientId,
    staleTime: QUERY_STALE_TIME.SHORT,
  });
}

export function useGenderStats() {
  return useQuery({
    queryKey: ["gender-stats"],
    queryFn: async () => {
      const response = await api.get("/analytics/gender-stats");
      return response.data.data as GenderStatsResponse;
    },
    staleTime: QUERY_STALE_TIME.MEDIUM,
  });
}
