// TypeScript interfaces for Incident data model
export interface SourceAlert {
  fingerprint?: string;
  startsAt?: string;
  labels?: Record<string, string>;
  [key: string]: any; // Allow additional properties from Prometheus
}

export interface Incident {
  id: string;
  title: string;
  service: string;
  environment: string;
  severity: 'critical' | 'warning' | 'info' | 'low';
  status: 'open' | 'acknowledged' | 'resolved';
  assignee?: string;
  source_alert?: SourceAlert;
  runbook_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface IncidentFilters {
  service?: string;
  environment?: string;
  status?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}
