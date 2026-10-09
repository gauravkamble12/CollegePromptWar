import React, { useState, useEffect } from 'react';
import { UserCheck, CheckCircle2, XCircle, Wrench, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { CivicReport } from '../types';

export const ModeratorView: React.FC = () => {
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [filter, setFilter] = useState<string>('pending_review');
  const [loading, setLoading] = useState<boolean>(false);
  const [actionNote, setActionNote] = useState<Record<number, string>>({});

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports(filter === 'all' ? undefined : filter);
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const handleAction = async (reportId: number, newStatus: string) => {
    const note = actionNote[reportId] || `Status updated to ${newStatus}`;
    try {
      await api.moderateReport(reportId, newStatus, note);
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Moderation action failed');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Civic Review & Moderation Queue</h2>
            <p className="text-xs text-slate-500">Authorized personnel review and corroboration workflow</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {['pending_review', 'verified', 'resolved', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                filter === f
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
          <button
            onClick={fetchReports}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            title="Refresh queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Reports Queue */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No civic reports currently found in this queue state.
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{report.title}</span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="capitalize font-semibold text-indigo-700">{report.category.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>Severity: {report.severity_level}</span>
                    <span>•</span>
                    <span>Corroboration: {report.corroboration_count} citizens</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                  {report.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{report.description}</p>
              {report.address_reference && (
                <div className="text-[11px] text-slate-500">
                  Location Reference: {report.address_reference} ({report.latitude}, {report.longitude})
                </div>
              )}

              {/* Moderator Action Input & Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Optional review note or municipal action ID..."
                  value={actionNote[report.id] || ''}
                  onChange={(e) => setActionNote({ ...actionNote, [report.id]: e.target.value })}
                  className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-600"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(report.id, 'verified')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verify Alert
                  </button>
                  <button
                    onClick={() => handleAction(report.id, 'resolved')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5" /> Mark Resolved
                  </button>
                  <button
                    onClick={() => handleAction(report.id, 'rejected')}
                    className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
