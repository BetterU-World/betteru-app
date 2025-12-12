"use client";

interface DiaryMedia {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
}

interface DiaryEntry {
  id: string;
  userId: string;
  date: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  media?: DiaryMedia[];
}

interface DiaryEntryModalProps {
  entry: DiaryEntry;
  onClose: () => void;
}

export default function DiaryEntryModal({ entry, onClose }: DiaryEntryModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Close on escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        className="bg-white rounded-xl p-6 shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {entry.title}
            </h2>
            <p className="text-sm text-slate-500">{formatDate(entry.date)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition ml-4"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="prose max-w-none">
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
            {entry.content}
          </p>
        </div>

        {/* Media */}
        {entry.media && entry.media.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-slate-900">Attachments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entry.media.map((media) => (
                <div key={media.id} className="rounded-lg overflow-hidden border border-slate-200">
                  {media.type === "IMAGE" ? (
                    <img
                      src={`/api/diary/media/${media.id}`}
                      alt="Entry attachment"
                      className="w-full h-auto object-contain max-h-96"
                    />
                  ) : (
                    <video
                      src={`/api/diary/media/${media.id}`}
                      controls
                      className="w-full h-auto max-h-96"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
