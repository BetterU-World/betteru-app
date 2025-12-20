"use client";

export const ONBOARDING_KEY = "betteru_onboarding_v1_dismissed";

export default function FirstTimeTipCard({
  onTryPrompt,
  onDismiss,
}: {
  onTryPrompt: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="mb-4 p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Welcome to BetterU</h3>
      <p className="text-sm text-slate-600 mt-1">
        Start with one honest entry. If you’re not sure what to write, try a quick reflection prompt.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onTryPrompt}
          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Try a prompt
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="px-3 py-1.5 text-sm bg-slate-100 text-slate-900 rounded-md border border-slate-200 hover:bg-slate-200 transition"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
