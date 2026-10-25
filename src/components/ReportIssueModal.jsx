import { X } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const issueTypes = [
  'Insurance not accepted',
  'Hospital closed',
  'Wrong address',
  'Other',
];

export default function ReportIssueModal({ hospital, onClose }) {
  const [issueType, setIssueType] = useState(issueTypes[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const { error: insertError } = await supabase.from('reported_issues').insert({
      hospital_id: hospital.id,
      hospital_name: hospital.name,
      issue_type: issueType,
      description: description.trim() || null,
    });
    setIsSubmitting(false);
    if (insertError) {
      setError('We could not submit this report. Please try again.');
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="report-issue-title">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Data quality</p>
            <h2 id="report-issue-title" className="mt-1 text-xl font-bold text-gray-900">Report Wrong Info</h2>
            <p className="mt-1 text-sm text-gray-500">{hospital.name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700" aria-label="Close report form"><X className="h-5 w-5" /></button>
        </div>
        {submitted ? (
          <div className="mt-6 rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-700">Thank you! Admin has been notified.</div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-700">Issue Type</span>
              <select value={issueType} onChange={(event) => setIssueType(event.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10">
                {issueTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-700">Description <span className="font-normal text-gray-400">(optional)</span></span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows="4" placeholder="Tell us what needs to be corrected..." className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10" />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Submitting...' : 'Submit Report'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
