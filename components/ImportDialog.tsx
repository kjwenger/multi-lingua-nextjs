'use client';

import { useState, useRef } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ImportProposals {
  english: string[];
  german: string[];
  french: string[];
  italian: string[];
  spanish: string[];
}

interface ImportRecord {
  english: string;
  german: string;
  french: string;
  italian: string;
  spanish: string;
  proposals: ImportProposals;
  category: string | null;
}

type AnalyzeStatus = 'create' | 'skip' | 'auto_update' | 'conflict';
type DecisionType = 'create' | 'auto_update' | 'ignore' | 'replace' | 'add_as_new';

interface AnalyzeResultItem {
  status: AnalyzeStatus;
  incoming: ImportRecord;
  existing?: {
    id: number;
    english: string;
    german: string;
    french: string;
    italian: string;
    spanish: string;
    proposals: ImportProposals;
    category: string | null;
  };
  conflictType?: { proposalsOnly: boolean };
}

interface AnalyzeResponse {
  total: number;
  creates: number;
  skips: number;
  autoUpdates: number;
  conflicts: number;
  results: AnalyzeResultItem[];
}

interface ExecuteResponse {
  created: number;
  replaced: number;
  addedAsNew: number;
  autoUpdated: number;
  ignored: number;
  errors: string[];
}

type DialogState = 'idle' | 'analyzing' | 'review' | 'executing' | 'complete';

interface ImportDialogProps {
  onClose: () => void;
  onComplete: () => void;
}

// ── Language config ───────────────────────────────────────────────────────────

const LANGUAGES = [
  { key: 'english' as const, flag: '🇬🇧', label: 'English' },
  { key: 'german' as const, flag: '🇩🇪', label: 'German' },
  { key: 'french' as const, flag: '🇫🇷', label: 'French' },
  { key: 'italian' as const, flag: '🇮🇹', label: 'Italian' },
  { key: 'spanish' as const, flag: '🇪🇸', label: 'Spanish' },
];

// ── ConflictCard ──────────────────────────────────────────────────────────────

interface ConflictCardProps {
  index: number;
  result: AnalyzeResultItem;
  decision: DecisionType;
  onDecision: (d: DecisionType) => void;
}

function ConflictCard({ index, result, decision, onDecision }: ConflictCardProps) {
  const { incoming, existing, conflictType } = result;

  return (
    <div className="border border-yellow-400 dark:border-yellow-600 rounded-lg overflow-hidden mb-3">
      <div className="bg-yellow-50 dark:bg-yellow-900/30 px-3 py-2 flex items-center gap-2">
        <span className="font-medium text-yellow-800 dark:text-yellow-200 text-sm">
          Conflict #{index + 1}: &quot;{incoming.english}&quot;
        </span>
        {conflictType?.proposalsOnly && (
          <span className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded">
            proposals differ
          </span>
        )}
      </div>

      <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-700">
        {/* Existing */}
        <div className="p-3 bg-white dark:bg-gray-800">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Existing</p>
          <div className="space-y-1">
            {LANGUAGES.map(({ key, flag, label }) => (
              <div key={key} className="flex gap-1 text-sm">
                <span className="w-5 flex-shrink-0">{flag}</span>
                <span className="text-gray-700 dark:text-gray-300">{existing?.[key] || <em className="text-gray-400">—</em>}</span>
              </div>
            ))}
            {existing?.category && (
              <div className="flex gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>🏷</span>
                <span>{existing.category}</span>
              </div>
            )}
          </div>
        </div>

        {/* Incoming */}
        <div className="p-3 bg-white dark:bg-gray-800">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Incoming</p>
          <div className="space-y-1">
            {LANGUAGES.map(({ key, flag }) => {
              const inVal = incoming[key] || '';
              const exVal = existing?.[key] || '';
              const differs = !conflictType?.proposalsOnly && inVal !== exVal;
              return (
                <div key={key} className="flex gap-1 text-sm">
                  <span className="w-5 flex-shrink-0">{flag}</span>
                  <span className={differs ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-700 dark:text-gray-300'}>
                    {inVal || <em className="text-gray-400">—</em>}
                  </span>
                </div>
              );
            })}
            {incoming.category && (
              <div className={`flex gap-1 text-xs mt-1 ${incoming.category !== existing?.category ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <span>🏷</span>
                <span>{incoming.category}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decision row */}
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 flex gap-2 flex-wrap">
        {(['ignore', 'replace', 'add_as_new'] as DecisionType[]).map(d => (
          <button
            key={d}
            onClick={() => onDecision(d)}
            className={`px-3 py-1 text-xs rounded border transition-colors ${
              decision === d
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            {d === 'ignore' ? 'Ignore' : d === 'replace' ? 'Replace' : 'Add as new'}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── ImportDialog ──────────────────────────────────────────────────────────────

export function ImportDialog({ onClose, onComplete }: ImportDialogProps) {
  const [state, setState] = useState<DialogState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [analyzeData, setAnalyzeData] = useState<AnalyzeResponse | null>(null);
  const [decisions, setDecisions] = useState<Record<number, DecisionType>>({});
  const [result, setResult] = useState<ExecuteResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File selection + analyze ────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setState('analyzing');

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/import?action=analyze', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data: AnalyzeResponse = await res.json();
      setAnalyzeData(data);

      // Pre-populate decisions: conflicts default to 'ignore', others keep their status
      const initial: Record<number, DecisionType> = {};
      data.results.forEach((r, i) => {
        if (r.status === 'conflict') initial[i] = 'ignore';
        else if (r.status === 'auto_update') initial[i] = 'auto_update';
        else if (r.status === 'create') initial[i] = 'create';
        // skip → no decision entry needed
      });
      setDecisions(initial);

      // If no conflicts → go straight to execute
      if (data.conflicts === 0) {
        await executeImport(data, initial);
      } else {
        setState('review');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze file');
      setState('idle');
    }
  };

  // ── Execute ─────────────────────────────────────────────────────────────────

  const executeImport = async (data: AnalyzeResponse, decs: Record<number, DecisionType>) => {
    setState('executing');
    setError(null);

    try {
      const decisionList = data.results
        .map((r, i) => {
          const decision = decs[i];
          if (!decision || r.status === 'skip') return null;
          return {
            incoming: r.incoming,
            existingId: r.existing?.id,
            decision,
          };
        })
        .filter(Boolean);

      const res = await fetch('/api/import?action=execute', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decisions: decisionList }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || `HTTP ${res.status}`);
      }

      const execResult: ExecuteResponse = await res.json();
      setResult(execResult);
      setState('complete');
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to execute import');
      setState('review');
    }
  };

  const handleExecute = () => executeImport(analyzeData!, decisions);

  const setAllConflictDecisions = (d: DecisionType) => {
    setDecisions(prev => {
      const next = { ...prev };
      analyzeData?.results.forEach((r, i) => {
        if (r.status === 'conflict') next[i] = d;
      });
      return next;
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const conflictResults = analyzeData?.results.filter(r => r.status === 'conflict') || [];

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">Import Translations</h2>
        {/* State badge */}
        {state === 'analyzing' && (
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">Analysing…</span>
        )}
        {state === 'review' && (
          <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">Review required</span>
        )}
        {state === 'executing' && (
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">Importing…</span>
        )}
        {state === 'complete' && (
          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Complete</span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Idle */}
        {state === 'idle' && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="text-center text-gray-600 dark:text-gray-400 max-w-sm">
              <p className="mb-2 font-medium text-gray-800 dark:text-gray-200">Select a <code>.ml.json.gz</code> export file to import</p>
              <p className="text-sm">Exact duplicates are skipped automatically. Records with differences will be shown for review.</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Select .ml.json.gz file…
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ml.json.gz,.gz"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Analyzing */}
        {state === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400">Analysing…</p>
          </div>
        )}

        {/* Review */}
        {state === 'review' && analyzeData && (
          <div>
            {/* Summary chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {analyzeData.creates > 0 && (
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                  {analyzeData.creates} new
                </span>
              )}
              {analyzeData.skips > 0 && (
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                  {analyzeData.skips} skip
                </span>
              )}
              {analyzeData.autoUpdates > 0 && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                  {analyzeData.autoUpdates} auto-update
                </span>
              )}
              {analyzeData.conflicts > 0 && (
                <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full">
                  {analyzeData.conflicts} conflict{analyzeData.conflicts !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Bulk buttons */}
            {conflictResults.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">All conflicts:</span>
                {(['ignore', 'replace', 'add_as_new'] as DecisionType[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setAllConflictDecisions(d)}
                    className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {d === 'ignore' ? 'Ignore all' : d === 'replace' ? 'Replace all' : 'Add all as new'}
                  </button>
                ))}
              </div>
            )}

            {/* Conflict cards */}
            {analyzeData.results.map((r, i) => {
              if (r.status !== 'conflict') return null;
              const conflictIdx = analyzeData.results.slice(0, i + 1).filter(x => x.status === 'conflict').length - 1;
              return (
                <ConflictCard
                  key={i}
                  index={conflictIdx}
                  result={r}
                  decision={decisions[i] ?? 'ignore'}
                  onDecision={d => setDecisions(prev => ({ ...prev, [i]: d }))}
                />
              );
            })}
          </div>
        )}

        {/* Executing */}
        {state === 'executing' && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400">Importing…</p>
          </div>
        )}

        {/* Complete */}
        {state === 'complete' && result && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Import complete</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {result.created > 0 && <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full">{result.created} created</span>}
              {result.replaced > 0 && <span className="text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full">{result.replaced} replaced</span>}
              {result.addedAsNew > 0 && <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">{result.addedAsNew} added as new</span>}
              {result.autoUpdated > 0 && <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">{result.autoUpdated} auto-updated</span>}
              {result.ignored > 0 && <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full">{result.ignored} ignored</span>}
            </div>
            {result.errors.length > 0 && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-300 text-sm w-full max-w-md">
                <p className="font-medium mb-1">{result.errors.length} error{result.errors.length !== 1 ? 's' : ''}:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* Footer — review only */}
      {state === 'review' && (
        <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Execute Import
          </button>
        </div>
      )}
    </div>
  );
}
