import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";
import { useAppStore } from "../../store/appStore";
import { format } from "date-fns";
import { Trash, Check } from "../Icons.jsx";

export default function ReportsModal({ serverId, onClose }) {
  const { reportsByServer, fetchReports, resolveReport, deleteMessage, removeMessageFromStore } = useAppStore();
  const [loading, setLoading] = useState(true);
  const reports = reportsByServer[serverId] || [];

  useEffect(() => {
    fetchReports(serverId).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId]);

  async function handleDismiss(reportId) {
    await resolveReport(serverId, reportId);
  }

  async function handleDeleteAndResolve(report) {
    await deleteMessage(report.message.id);
    removeMessageFromStore(report.message.id, null, null);
    await resolveReport(serverId, report.id);
  }

  return (
    <Modal title="Raporlar" onClose={onClose} width="max-w-lg">
      {loading && <p className="text-sm text-gray-500">Yukleniyor...</p>}
      {!loading && reports.length === 0 && <p className="text-sm text-gray-500">Acik rapor yok.</p>}
      <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
        {reports.map((r) => (
          <div key={r.id} className="bg-base-900 border border-base-600 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-warn">{r.reason}</span>
              <span className="text-[11px] text-gray-500 mono">{format(new Date(r.createdAt), "d MMM HH:mm")}</span>
            </div>
            <p className="text-xs text-gray-400 mb-1">
              <span className="font-medium text-gray-300">{r.message.author.username}</span> tarafindan, rapor eden:{" "}
              <span className="font-medium text-gray-300">{r.reporter.username}</span>
            </p>
            <p className="text-sm text-gray-200 bg-base-800 rounded px-2 py-1.5 mb-2 break-words">{r.message.content}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDeleteAndResolve(r)}
                className="flex items-center gap-1.5 text-xs font-semibold text-warn hover:underline"
              >
                <Trash size={13} /> Mesaji sil
              </button>
              <button
                onClick={() => handleDismiss(r.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-ink"
              >
                <Check size={13} /> Yoksay
              </button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
