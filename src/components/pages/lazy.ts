import { lazy } from "react";

export const AnalyticsPageLazy = lazy(() => import("./AnalyticsPage"));
export const PatientsPageLazy = lazy(() => import("./PatientsPage"));
export const UsersPageLazy = lazy(() => import("./UsersPage"));
export const ConsultationPageLazy = lazy(() => import("./ConsultationPage"));
export const PatientConsultationsPageLazy = lazy(() => import("./PatientConsultationsPage"));

export const WaitingRoomPageLazy = lazy(() => import("./WaitingRoomPage"));
export const PreConsultationPageLazy = lazy(() => import("./PreConsultationPage"));
