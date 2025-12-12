"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import MiniCalendar from "@/components/MiniCalendar";
import DiaryEntryModal from "@/components/DiaryEntryModal";
import NewDiaryEntryDialog from "@/components/diary/NewDiaryEntryDialog";
import { getDatesWithEntries, formatDateForAPI } from "@/lib/calendar-utils";
import type { CalendarSuggestion } from "@prisma/client";
import { encryptDiaryContent, decryptDiaryContent, EncryptedDiaryPayload } from "@/lib/crypto/diary";
import { saveLocalEntry, getLocalEntries, deleteLocalEntry } from "@/lib/diary/localStore";
import type { LocalDiaryEntryRecord } from "@/lib/diary/types";

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
  contentPreview?: string;
  createdAt: string;
  updatedAt: string;
  media?: DiaryMedia[];
  isLocalOnly?: boolean;
}

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [locked, setLocked] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [localOnly, setLocalOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[] | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [showNewEntryDialog, setShowNewEntryDialog] = useState(false);
  const [newEntryDate, setNewEntryDate] = useState<Date | undefined>(undefined);
  const [suggestions, setSuggestions] = useState<CalendarSuggestion[]>([]);
  const entriesRef = useRef<HTMLDivElement>(null);
  const entryRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch entries on mount
  useEffect(() => {
    checkLockAndFetch();
    fetchSuggestions();
  }, []);

  async function checkLockAndFetch() {
    try {
      const res = await fetch("/api/settings/privacy");
      const data = await res.json();
      const enabled = !!data.settings?.diaryLockEnabled;
      const cookieUnlocked = document.cookie.includes("diary_unlocked=true");
      if (enabled && !cookieUnlocked) {
        setLocked(true);
        setFetching(false);
        return;
      }
      setLocked(false);
      await fetchEntries();
    } catch (e) {
      setLocked(false);
      await fetchEntries();
    }
  }

  const fetchEntries = async () => {
    try {
      setFetching(true);
      const res = await fetch("/api/diary");
      const data = await res.json();
      
      if (res.ok) {
        const cloudEntries: DiaryEntry[] = data.entries || [];
        let localEntries: LocalDiaryEntryRecord[] = [];
        try {
          localEntries = await getLocalEntries();
        } catch (e) {
          // IndexedDB not available or failed: proceed with cloud only
          localEntries = [];
        }
        const mappedLocal: DiaryEntry[] = localEntries.map((le) => ({
          id: le.localId,
          userId: "local",
          date: le.date,
          title: le.title + " (Local-only)",
          content: "", // never store plaintext; content rendered after decrypt if needed
          contentPreview: undefined,
          createdAt: le.createdAt,
          updatedAt: le.updatedAt,
          media: [],
          isLocalOnly: true,
        }));
        const merged = [...cloudEntries, ...mappedLocal].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEntries(merged);
      } else {
        console.error("Failed to fetch entries:", data.error);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);
    if (!/^[0-9]{4,6}$/.test(pin)) {
      setUnlockError("Enter a 4–6 digit PIN");
      return;
    }
    try {
      const res = await fetch("/api/settings/diary-lock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        setUnlockError("Incorrect passcode");
        return;
      }
      setLocked(false);
      await fetchEntries();
    } catch (err) {
      setUnlockError("Failed to unlock");
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await fetch("/api/calendar-suggestions");
      const data = await res.json();
      
      if (res.ok) {
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith("image/") || file.type.startsWith("video/");
      const isUnder10MB = file.size <= 10 * 1024 * 1024;
      
      if (!isValid) {
        alert(`${file.name} is not a valid image or video file`);
        return false;
      }
      if (!isUnder10MB) {
        alert(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert("Please fill in both title and content");
      return;
    }

    try {
      setLoading(true);
      const nowIso = new Date().toISOString();
      if (localOnly) {
        if (selectedFiles.length > 0) {
          alert("Attachments are not supported for local-only yet.");
          setLoading(false);
          return;
        }
        const needsPin = !locked;
        if ((locked || needsPin) && !/^[0-9]{4,6}$/.test(pin)) {
          alert("Enter your 4–6 digit PIN to encrypt");
          setLoading(false);
          return;
        }
        const enc: EncryptedDiaryPayload = await encryptDiaryContent(pin, content.trim());
        const localRecord: LocalDiaryEntryRecord = {
          localId: crypto.randomUUID(),
          storageMode: "local",
          title: title.trim(),
          date: nowIso,
          contentCiphertext: enc.ciphertextB64,
          contentIv: enc.ivB64,
          contentSalt: enc.saltB64,
          contentAlg: enc.alg,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        await saveLocalEntry(localRecord);
        const viewEntry: DiaryEntry = {
          id: localRecord.localId,
          userId: "local",
          date: localRecord.date,
          title: localRecord.title + " (Local-only)",
          content: "",
          createdAt: localRecord.createdAt,
          updatedAt: localRecord.updatedAt,
          media: [],
          isLocalOnly: true,
        };
        setEntries([viewEntry, ...entries]);
      } else {
        let payload: any = { title: title.trim(), date: nowIso };
        if (locked) {
          if (!/^[0-9]{4,6}$/.test(pin)) {
            alert("Enter your 4–6 digit PIN to encrypt");
            setLoading(false);
            return;
          }
          const enc: EncryptedDiaryPayload = await encryptDiaryContent(pin, content.trim());
          payload = {
            ...payload,
            contentCiphertext: enc.ciphertextB64,
            contentIv: enc.ivB64,
            contentSalt: enc.saltB64,
            contentAlg: enc.alg,
          };
        } else {
          payload = { ...payload, content: content.trim() };
        }

        const res = await fetch("/api/diary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to save entry");
          return;
        }

        if (selectedFiles.length > 0) {
          const formData = new FormData();
          formData.append("entryId", data.entry.id);
          selectedFiles.forEach(file => {
            formData.append("files", file);
          });

          const uploadRes = await fetch("/api/upload/diary-media", {
            method: "POST",
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            data.entry.media = uploadData.media;
          }
        }

        setEntries([data.entry, ...entries]);
      }
      
      // Clear form
      setTitle("");
      setContent("");
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateContent = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Scroll to entries section when date is selected
  useEffect(() => {
    if (selectedDate && entriesRef.current) {
      entriesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedDate]);

  // Compute marked dates from entries
  const markedDates = Array.from(
    new Set(
      entries.map((entry) =>
        new Date(entry.date || entry.createdAt).toISOString().slice(0, 10)
      )
    )
  );

  // Filter entries based on selected date
  const displayedEntries = filteredEntries !== null ? filteredEntries : entries;

  if (locked) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold mb-4">Diary Locked</h1>
        <p className="text-gray-600 mb-6">Enter your passcode to unlock your private entries.</p>
        <form onSubmit={handleUnlock} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]{4,6}"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter 4–6 digit PIN"
          />
          {unlockError && <div className="text-red-600 text-sm">{unlockError}</div>}
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Unlock
          </button>
        </form>
      </div>
    );
  }

  const handleDateClick = (date: Date) => {
    const dateISO = date.toISOString().slice(0, 10);
    setSelectedDate(dateISO);

    // Filter entries for the clicked date
    const filtered = entries.filter((entry) => {
      const entryDate = new Date(entry.date || entry.createdAt)
        .toISOString()
        .slice(0, 10);
      return entryDate === dateISO;
    });

    setFilteredEntries(filtered);

    if (filtered.length > 0) {
      // If there are entries for this date, scroll to the first one
      const firstEntry = filtered[0];
      setSelectedEntry(firstEntry);
      
      // Scroll to the entry after a brief delay to ensure render
      setTimeout(() => {
        const entryElement = entryRefs.current.get(firstEntry.id);
        if (entryElement) {
          entryElement.scrollIntoView({ 
            behavior: "smooth", 
            block: "center" 
          });
          // Highlight effect
          entryElement.classList.add("ring-2", "ring-purple-500");
          setTimeout(() => {
            entryElement.classList.remove("ring-2", "ring-purple-500");
          }, 2000);
        }
      }, 100);
    } else {
      // No entries for this date - open create dialog
      setNewEntryDate(date);
      setShowNewEntryDialog(true);
    }
  };

  const clearFilter = () => {
    setSelectedDate(null);
    setFilteredEntries(null);
    setSelectedEntry(null);
  };

  const handleEntryClick = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
  };

  const promoteToCloud = async (localId: string) => {
    try {
      if (!/^[0-9]{4,6}$/.test(pin)) {
        alert("Enter your 4–6 digit PIN to promote");
        return;
      }
      // Find the record in IDB
      const locals = await getLocalEntries();
      const record = locals.find((r) => r.localId === localId);
      if (!record) return;
      // Decrypt locally to plaintext
      const payload: EncryptedDiaryPayload = {
        ciphertextB64: record.contentCiphertext,
        ivB64: record.contentIv,
        saltB64: record.contentSalt,
        alg: record.contentAlg,
      };
      const plaintext = await decryptDiaryContent(pin, payload);

      // Build server payload depending on lock
      let serverPayload: any = { title: record.title, date: record.date };
      if (locked) {
        const enc = await encryptDiaryContent(pin, plaintext);
        serverPayload = {
          ...serverPayload,
          contentCiphertext: enc.ciphertextB64,
          contentIv: enc.ivB64,
          contentSalt: enc.saltB64,
          contentAlg: enc.alg,
        };
      } else {
        serverPayload = { ...serverPayload, content: plaintext };
      }

      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serverPayload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to promote entry");
      }
      await deleteLocalEntry(localId);
      await fetchEntries();
    } catch (e) {
      console.error("Promote failed", e);
      alert("Failed to promote entry to cloud");
    }
  };

  const handleCreateEntry = async (entryData: { title: string; content: string; date: string; storageMode: "cloud" | "local" }) => {
    try {
      if (entryData.storageMode === "local") {
        if (!/^[0-9]{4,6}$/.test(pin)) throw new Error("PIN required to encrypt");
        const enc: EncryptedDiaryPayload = await encryptDiaryContent(pin, entryData.content);
        const localRecord: LocalDiaryEntryRecord = {
          localId: crypto.randomUUID(),
          storageMode: "local",
          title: entryData.title,
          date: new Date(entryData.date).toISOString(),
          contentCiphertext: enc.ciphertextB64,
          contentIv: enc.ivB64,
          contentSalt: enc.saltB64,
          contentAlg: enc.alg,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await saveLocalEntry(localRecord);
        await fetchEntries();
        setSelectedDate(entryData.date);
        setShowNewEntryDialog(false);
        setNewEntryDate(undefined);
      } else {
        let payload: any = { title: entryData.title, date: entryData.date };
        if (locked) {
          if (!/^[0-9]{4,6}$/.test(pin)) throw new Error("PIN required to encrypt");
          const enc: EncryptedDiaryPayload = await encryptDiaryContent(pin, entryData.content);
          payload = {
            ...payload,
            contentCiphertext: enc.ciphertextB64,
            contentIv: enc.ivB64,
            contentSalt: enc.saltB64,
            contentAlg: enc.alg,
          };
        } else {
          payload = { ...payload, content: entryData.content };
        }

        const res = await fetch("/api/diary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          await fetchEntries();
          setSelectedDate(entryData.date);
          setShowNewEntryDialog(false);
          setNewEntryDate(undefined);
        } else {
          throw new Error("Failed to create entry");
        }
      }
    } catch (error) {
      console.error("Error creating entry:", error);
      throw error;
    }
  };

  const formatFilterDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Diary</h1>
            <p className="text-sm text-slate-500 mt-1">
              Journal your thoughts, wins, and reflections.
            </p>
          </div>
          <a
            href="/calendar?calendar=diary"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>View in Calendar</span>
          </a>
        </div>

        {/* New Entry Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">New Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts here..."
                rows={6}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                disabled={loading}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Attach Photos/Videos (Optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                disabled={loading}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p className="text-xs text-slate-500 mt-1">
                Max 10MB per file. Supports images and videos.
              </p>
            </div>

            {/* File Previews */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">
                  Selected files ({selectedFiles.length}):
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="relative group border border-slate-200 rounded-lg p-2"
                    >
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-20 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-20 bg-slate-100 rounded flex items-center justify-center">
                          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <p className="text-xs text-slate-600 mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={localOnly}
                  onChange={(e) => setLocalOnly(e.target.checked)}
                  disabled={loading}
                />
                <span>Store locally only</span>
              </label>

              <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white rounded-md px-4 py-2 font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Entry"}
              </button>
            </div>
          </form>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entries List - Left Column (2/3 width on large screens) */}
          <div className="lg:col-span-2" ref={entriesRef}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Entries</h2>
            {selectedDate && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">
                  Showing entries for {formatFilterDate(selectedDate)}
                </span>
                <button
                  onClick={clearFilter}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>
          
          {fetching ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
              <p className="text-slate-600">Loading entries...</p>
            </div>
          ) : displayedEntries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
              <p className="text-slate-600">
                {selectedDate
                  ? "No entries for this date."
                  : "No entries yet. Start journaling by creating your first entry above!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedEntries.map((entry) => (
                <div
                  key={entry.id}
                  ref={(el) => {
                    if (el) {
                      entryRefs.current.set(entry.id, el);
                    } else {
                      entryRefs.current.delete(entry.id);
                    }
                  }}
                  onClick={() => handleEntryClick(entry)}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {entry.title}
                    </h3>
                    <span className="text-sm text-slate-500">
                      {formatDate(entry.date)}
                    </span>
                  </div>
                  {entry.isLocalOnly && (
                    <div className="mb-2">
                      <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
                        Local-only
                      </span>
                    </div>
                  )}
                  <p className="text-slate-700 whitespace-pre-wrap mb-3">
                    {entry.contentPreview ? entry.contentPreview : truncateContent(entry.content)}
                  </p>
                  
                  {/* Media Indicators */}
                  {entry.media && entry.media.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                      <div className="flex gap-2 overflow-x-auto">
                        {entry.media.slice(0, 4).map((media) => (
                          <div key={media.id} className="flex-shrink-0">
                            {media.type === "IMAGE" ? (
                              <img
                                src={media.url}
                                alt=""
                                className="w-16 h-16 object-cover rounded border border-slate-200"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-slate-100 rounded border border-slate-200 flex items-center justify-center">
                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                        {entry.media.length > 4 && (
                          <div className="w-16 h-16 bg-slate-100 rounded border border-slate-200 flex items-center justify-center">
                            <span className="text-xs font-medium text-slate-600">
                              +{entry.media.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {entry.isLocalOnly && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); promoteToCloud(entry.id); }}
                        className="text-sm px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200"
                      >
                        Promote to cloud
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          </div>

          {/* Mini Calendar Section - Right Column (1/3 width on large screens) */}
          {!fetching && (
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Quick Navigation</h2>
                  <button
                    onClick={() => {
                      setNewEntryDate(new Date());
                      setShowNewEntryDialog(true);
                    }}
                    className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                  >
                    + New
                  </button>
                </div>
                <MiniCalendar
                  datesWithEntries={getDatesWithEntries(entries.map(e => ({ ...e, date: e.date })))}
                  datesWithSuggestions={new Set(suggestions.map(s => formatDateForAPI(new Date(s.suggestedDate))))}
                  selectedDate={selectedDate}
                  onDateClick={(date) => {
                    handleDateClick(date);
                  }}
                />
                
                {/* Quick Stats */}
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Stats
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Total Entries:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {entries.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Month:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {entries.filter(e => {
                          const entryDate = new Date(e.date);
                          const now = new Date();
                          return entryDate.getMonth() === now.getMonth() &&
                                 entryDate.getFullYear() === now.getFullYear();
                        }).length}
                      </span>
                    </div>
                    {selectedDate && (
                      <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span>Selected Date:</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {displayedEntries.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Entry Modal */}
      {selectedEntry && (
        <DiaryEntryModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}

      {/* New Entry Dialog */}
      <NewDiaryEntryDialog
        isOpen={showNewEntryDialog}
        onClose={() => {
          setShowNewEntryDialog(false);
          setNewEntryDate(undefined);
        }}
        onSave={handleCreateEntry}
        initialDate={newEntryDate}
      />
    </div>
  );
}
