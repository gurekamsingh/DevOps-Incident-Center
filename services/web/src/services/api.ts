// API service for fetching incidents from the backend
import type { Incident } from '../types/incident';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export class ApiError extends Error {
    status?: number;
    constructor(message: string, status?: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
  }
}

export const incidentApi = {
  async getIncidents(): Promise<Incident[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/incidents/`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch incidents: ${response.statusText}`, response.status);
      }
      
      const incidents = await response.json();
      return incidents;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error: Unable to connect to the API');
    }
  },

  async getIncident(id: string): Promise<Incident> {
    try {
      const response = await fetch(`${API_BASE_URL}/incidents/${id}`);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch incident: ${response.statusText}`, response.status);
      }
      
      const incident = await response.json();
      return incident;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error: Unable to connect to the API');
    }
  }
};
