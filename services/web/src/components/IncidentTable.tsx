import React, { useState, useEffect } from 'react';
import { Incident, IncidentFilters, ApiResponse } from '../types/incident';
import { incidentApi, ApiError } from '../services/api';

interface IncidentTableProps {
  className?: string;
}

const IncidentTable: React.FC<IncidentTableProps> = ({ className = '' }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<IncidentFilters>({});

  // Fetch incidents on component mount
  useEffect(() => {
    fetchIncidents();
  }, []);

  // Apply filters when incidents or filters change
  useEffect(() => {
    applyFilters();
  }, [incidents, filters]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await incidentApi.getIncidents();
      setIncidents(data);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch incidents';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = incidents;

    if (filters.service) {
      filtered = filtered.filter(incident => incident.service === filters.service);
    }
    if (filters.environment) {
      filtered = filtered.filter(incident => incident.environment === filters.environment);
    }
    if (filters.status) {
      filtered = filtered.filter(incident => incident.status === filters.status);
    }

    setFilteredIncidents(filtered);
  };

  const toggleRowExpansion = (incidentId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(incidentId)) {
      newExpandedRows.delete(incidentId);
    } else {
      newExpandedRows.add(incidentId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-50 border-l-4 border-red-500 text-red-900';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-900';
      case 'info':
        return 'bg-blue-50 border-l-4 border-blue-500 text-blue-900';
      default:
        return 'bg-gray-50 border-l-4 border-gray-500 text-gray-900';
    }
  };

  const getSeverityBadgeColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'acknowledged':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  // Get unique values for filter dropdowns
  const uniqueServices = [...new Set(incidents.map(i => i.service))];
  const uniqueEnvironments = [...new Set(incidents.map(i => i.environment))];
  const uniqueStatuses = [...new Set(incidents.map(i => i.status))];

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading incidents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading incidents</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={fetchIncidents}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="service-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Service
            </label>
            <select
              id="service-filter"
              value={filters.service || ''}
              onChange={(e) => setFilters({ ...filters, service: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Services</option>
              {uniqueServices.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="environment-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Environment
            </label>
            <select
              id="environment-filter"
              value={filters.environment || ''}
              onChange={(e) => setFilters({ ...filters, environment: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Environments</option>
              {uniqueEnvironments.map(env => (
                <option key={env} value={env}>{env}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      {filteredIncidents.length === 0 ? (
        <div className="bg-white rounded-lg shadow border p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No incidents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {incidents.length === 0 ? 'No incidents have been reported yet.' : 'No incidents match the current filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Incidents ({filteredIncidents.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Environment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIncidents.map((incident) => (
                  <React.Fragment key={incident.id}>
                    <tr className={`hover:bg-gray-50 ${getSeverityColor(incident.severity)}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{incident.title}</div>
                        {incident.assignee && (
                          <div className="text-sm text-gray-500">Assigned to: {incident.assignee}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {incident.service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {incident.environment}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadgeColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(incident.status)}`}>
                          {incident.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(incident.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleRowExpansion(incident.id)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          {expandedRows.has(incident.id) ? 'Collapse' : 'Expand'}
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(incident.id) && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            {incident.runbook_url && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Runbook</h4>
                                <a
                                  href={incident.runbook_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                                >
                                  {incident.runbook_url}
                                </a>
                              </div>
                            )}
                            {incident.source_alert && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Alert Payload</h4>
                                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                  {JSON.stringify(incident.source_alert, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentTable;
