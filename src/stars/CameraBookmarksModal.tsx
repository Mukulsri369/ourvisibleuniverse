import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, type CameraBookmark } from "./store";
import {
  Bookmark,
  X,
  Plus,
  Trash2,
  Compass,
  Telescope,
  Globe,
  Radio,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export function CameraBookmarksModal() {
  const open = useStore((s) => s.bookmarksModalOpen);
  const setOpen = useStore((s) => s.setBookmarksModalOpen);
  const bookmarks = useStore((s) => s.cameraBookmarks);
  const saveBookmark = useStore((s) => s.saveCameraBookmark);
  const deleteBookmark = useStore((s) => s.deleteCameraBookmark);
  const loadBookmark = useStore((s) => s.loadCameraBookmark);
  const distance = useStore((s) => s.cameraDistance);

  const [activeTab, setActiveTab] = useState<"curated" | "user">("curated");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  if (!open) return null;

  const curatedList = bookmarks.filter((b) => b.category !== "user");
  const userList = bookmarks.filter((b) => b.category === "user");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    saveBookmark(newTitle.trim(), newDesc.trim());
    setNewTitle("");
    setNewDesc("");
    setIsAdding(false);
    setActiveTab("user");
  };

  const handleSelectBookmark = (bm: CameraBookmark) => {
    loadBookmark(bm);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 backdrop-blur-md"
        style={{ background: "rgba(2, 4, 12, 0.82)" }}
        onClick={() => setOpen(false)}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative flex h-[82vh] w-full max-w-2xl flex-col rounded-2xl border border-white/15 bg-[#090b1c] text-white shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Bookmark className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-medium text-white tracking-wide">
                  Camera Vistas &amp; Bookmarks
                </h2>
                <p className="text-xs text-white/50">
                  Instant teleportation to iconic astronomical perspectives or save custom
                  viewpoints
                </p>
              </div>
            </div>
            <button
              aria-label="Close camera bookmarks"
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tab Selector & Add button */}
          <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-6 py-2.5 text-xs">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("curated")}
                className={`rounded-lg px-3 py-1.5 font-medium transition ${
                  activeTab === "curated"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Curated Scientific Vistas ({curatedList.length})
              </button>
              <button
                onClick={() => setActiveTab("user")}
                className={`rounded-lg px-3 py-1.5 font-medium transition ${
                  activeTab === "user"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-white/60 hover:text-white"
                }`}
              >
                My Saved Vistas ({userList.length})
              </button>
            </div>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Save Current View</span>
            </button>
          </div>

          {/* Add Bookmark Drawer */}
          <AnimatePresence>
            {isAdding && (
              <motion.form
                onSubmit={handleSave}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-b border-white/10 bg-cyan-950/20 p-4 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyan-300 text-[11px] uppercase tracking-wider">
                    Save Current Position As Bookmark
                  </span>
                  <span className="font-mono text-white/50 text-[10px]">
                    Current Distance:{" "}
                    {distance >= 1e9
                      ? (distance / 1e9).toFixed(2) + " Gly"
                      : distance >= 1e6
                        ? (distance / 1e6).toFixed(2) + " Mly"
                        : distance >= 1
                          ? distance.toFixed(1) + " ly"
                          : (distance * 63241).toFixed(2) + " AU"}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Bookmark Title (e.g. Orion Nebula Peak View)"
                    required
                    className="rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-white placeholder:text-white/35 focus:border-cyan-400 focus:outline-none"
                  />
                  <input
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Optional notes or observation description..."
                    className="rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-white placeholder:text-white/35 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="rounded-lg border border-white/10 px-3 py-1 text-white/60 hover:bg-white/10 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-cyan-400 px-4 py-1 font-semibold text-black hover:bg-cyan-300 transition"
                  >
                    Confirm Save
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Bookmarks List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {(activeTab === "curated" ? curatedList : userList).map((bm) => (
              <div
                key={bm.id}
                onClick={() => handleSelectBookmark(bm)}
                className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3.5 transition hover:border-cyan-400/40 hover:bg-white/[0.05] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/40 text-cyan-300">
                    {bm.category === "solar_system" ? (
                      <Globe className="h-4 w-4" />
                    ) : bm.category === "stars" ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      <Compass className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white group-hover:text-cyan-200">
                        {bm.title}
                      </span>
                      <span className="font-mono text-[10px] text-white/40">{bm.subtitle}</span>
                    </div>
                    <p className="text-xs text-white/55 line-clamp-1 mt-0.5">{bm.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {bm.category === "user" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBookmark(bm.id);
                      }}
                      title="Delete Bookmark"
                      className="grid h-7 w-7 place-items-center rounded-lg text-white/40 hover:bg-red-500/20 hover:text-red-300 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <div className="flex items-center gap-1 text-xs font-semibold text-cyan-300 group-hover:translate-x-1 transition">
                    <span>Teleport</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            ))}

            {activeTab === "user" && userList.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-white/40">
                <Bookmark className="h-8 w-8 text-white/20 mb-2" />
                <p className="text-sm font-medium text-white/70">No custom viewpoints saved yet</p>
                <p className="text-xs text-white/40 mt-1 max-w-sm">
                  Navigate to any vista in the universe and click &quot;Save Current View&quot; to
                  bookmark it for instant recall anytime.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
