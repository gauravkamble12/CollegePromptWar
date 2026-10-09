import React, { useState, useEffect } from 'react';
import { Flag, Upload, Shield, Mic, CheckCircle2, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { CivicReport } from '../types';
import { useAuth } from '../context/AuthContext';

export const CitizenReportForm: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Form State
  const [category, setCategory] = useState('road_damage');
  const [severity, setSeverity] = useState('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [addressRef, setAddressRef] = useState('Near FC Road, Shivajinagar');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const data = await api.getReports();
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setFeedback(null);
    try {
      const res = await api.uploadPhoto(file);
      setPhotoUrl(res.url);
      setFeedback({ type: 'success', message: res.message });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Image upload failed' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      await api.submitReport({
        category,
        severity_level: severity,
        title,
        description,
        latitude: 18.5225,
        longitude: 73.8415,
        address_reference: addressRef,
        photo_url: photoUrl || undefined
      });
      setFeedback({
        type: 'success',
        message: 'Report submitted! It is in Pending Review and flagged for municipal/moderator corroboration.'
      });
      setTitle('');
      setDescription('');
      setPhotoUrl(null);
      fetchReports();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit report' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Submission Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Citizen Reporting & Community Intelligence</h2>
            <p className="text-xs text-slate-500">Report civic hazards, road damage, and accessibility obstacles</p>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs mb-4 flex items-start gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-indigo-600 focus:outline-hidden"
              >
                <option value="road_damage">Road Damage / Pothole</option>
                <option value="waterlogging">Waterlogging / Drainage</option>
                <option value="broken_streetlights">Broken Streetlights</option>
                <option value="accessibility_obstacle">Accessibility Obstacle</option>
                <option value="waste_accumulation">Waste Accumulation</option>
                <option value="traffic_disruption">Traffic Disruption</option>
                <option value="public_hazard">Public Safety Hazard</option>
                <option value="temporary_closure">Temporary Road Closure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-indigo-600 focus:outline-hidden"
              >
                <option value="low">Low (Cosmetic/Minor)</option>
                <option value="medium">Medium (Impediment)</option>
                <option value="high">High (Direct Danger)</option>
                <option value="critical">Critical (Immediate Road Block)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Report Title</label>
            <input
              type="text"
              required
              minLength={5}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep pothole near Goodluck Chowk pedestrian crossing"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Location Reference</label>
            <input
              type="text"
              value={addressRef}
              onChange={(e) => setAddressRef(e.target.value)}
              placeholder="Street name, landmark, or crossing"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Detailed Description</label>
            <textarea
              required
              minLength={10}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue, approximate size, and impact on pedestrians or traffic..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          {/* Image Upload with EXIF Scrubber Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-indigo-600" /> Evidence Photo (Optional)
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <Shield className="w-3 h-3" /> EXIF GPS Scrubber Active
              </span>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto}
              className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {uploadingPhoto && <p className="text-[10px] text-indigo-600 mt-1">Sanitizing and uploading image...</p>}
            {photoUrl && <p className="text-[10px] text-emerald-600 font-medium mt-1">✓ Photo scrubbed of all GPS & metadata.</p>}
          </div>

          <button
            type="submit"
            disabled={submitting || !title || !description}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting Report...' : 'Submit Civic Observation'}
          </button>
        </form>
      </div>

      {/* Community Reports Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col h-[650px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Active Community Reports</h3>
            <p className="text-xs text-slate-500">Live citizen observations undergoing verification</p>
          </div>
          <button
            onClick={fetchReports}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            title="Refresh stream"
          >
            <RefreshCw className={`w-4 h-4 ${loadingReports ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {reports.map((rep) => {
            const isVerified = rep.status === 'verified';
            const isResolved = rep.status === 'resolved';

            return (
              <div
                key={rep.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-bold text-slate-900 text-xs leading-snug">{rep.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                      isResolved
                        ? 'bg-emerald-100 text-emerald-800'
                        : isVerified
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rep.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-2 leading-relaxed">{rep.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <span className="capitalize text-slate-700 font-semibold">{rep.category.replace('_', ' ')}</span>
                  <span className="font-medium text-indigo-600">
                    {rep.corroboration_count} citizen verifications
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
