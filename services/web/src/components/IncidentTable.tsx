import React, { useState, useEffect } from 'react';
import type { Incident, IncidentFilters, ApiResponse } from '../types/incident';
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
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch incidents on component mount
  useEffect(() => {
    fetchIncidents();
  }, []);

  // Apply filters when incidents or filters change
  useEffect(() => {
    applyFilters();
  }, [incidents, filters]);

  // Auto-hide notifications after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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

  const clearFilters = () => {
    setFilters({});
  };

  const updateIncidentStatus = async (incidentId: string, newStatus: 'open' | 'acknowledged' | 'resolved') => {
    try {
      setUpdatingStatus(prev => new Set(prev).add(incidentId));
      
      // Optimistic update
      setIncidents(prev => prev.map(incident => 
        incident.id === incidentId 
          ? { ...incident, status: newStatus, updated_at: new Date().toISOString() }
          : incident
      ));

      await incidentApi.updateIncidentStatus(incidentId, newStatus);
      setNotification({ message: `Status updated to ${newStatus}`, type: 'success' });
      
      // Refresh to get the actual updated_at from server
      await fetchIncidents();
    } catch (err) {
      // Revert optimistic update on error
      await fetchIncidents();
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update status';
      setNotification({ message: errorMessage, type: 'error' });
    } finally {
      setUpdatingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(incidentId);
        return newSet;
      });
    }
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
      case 'major':
        return 'bg-orange-50 border-l-4 border-orange-500 text-orange-900';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-900';
      case 'info':
        return 'bg-blue-50 border-l-4 border-blue-500 text-blue-900';
      case 'low':
        return 'bg-green-50 border-l-4 border-green-500 text-green-900';
      default:
        return 'bg-gray-50 border-l-4 border-gray-500 text-gray-900';
    }
  };

  const getSeverityBadgeColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-critical text-white border border-red-300';
      case 'major':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'warning':
        return 'bg-warning text-white border border-amber-300';
      case 'info':
        return 'bg-info text-white border border-blue-300';
      case 'low':
        return 'bg-success text-white border border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'acknowledged':
        return 'bg-warning text-white border border-amber-300';
      case 'resolved':
        return 'bg-success text-white border border-green-300';
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
      {/* Notification */}
      {notification && (
        <div className={`rounded-md p-4 ${notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear all filters
          </button>
        </div>
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
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(incident.status)}`}>
                            {incident.status}
                          </span>
                          {incident.status !== 'resolved' && (
                            <select
                              value={incident.status}
                              onChange={(e) => updateIncidentStatus(incident.id, e.target.value as 'open' | 'acknowledged' | 'resolved')}
                              disabled={updatingStatus.has(incident.id)}
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                            >
                              <option value="open">Open</option>
                              <option value="acknowledged">Acknowledged</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(incident.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleRowExpansion(incident.id)}
                          className="text-blue-600 hover:text-blue-900 transition-colors flex items-center"
                        >
                          {expandedRows.has(incident.id) ? (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                              Collapse
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              Expand
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(incident.id) && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Incident Details</h4>
                                <dl className="text-sm space-y-1">
                                  <div className="flex">
                                    <dt className="font-medium text-gray-500 w-20">ID:</dt>
                                    <dd className="text-gray-900 font-mono text-xs">{incident.id}</dd>
                                  </div>
                                  {incident.updated_at && (
                                    <div className="flex">
                                      <dt className="font-medium text-gray-500 w-20">Updated:</dt>
                                      <dd className="text-gray-900">{formatDate(incident.updated_at)}</dd>
                                    </div>
                                  )}
                                </dl>
                              </div>
                              {incident.runbook_url && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Runbook</h4>
                                  <a
                                    href={incident.runbook_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 underline text-sm"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Open Runbook
                                  </a>
                                </div>
                              )}
                            </div>
                            {incident.source_alert && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Alert Payload</h4>
                                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto border">
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
