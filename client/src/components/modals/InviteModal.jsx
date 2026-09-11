import { useState } from "react";
import Modal from "./Modal.jsx";

export default function InviteModal({ server, onClose }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(server.inviteCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <Modal title={`${server.name} sunucusuna davet et`} onClose={onClose}>
      <p className="text-sm text-gray-400 mb-3">Bu kodu paylas, arkadaslarin "Davetle Katil" ile sunucuna katilabilir.</p>
      <div className="flex items-center gap-2 bg-base-900 rounded-lg px-3 py-2.5">
        <code className="flex-1 text-teal font-semibold text-sm truncate">{server.inviteCode}</code>
        <button onClick={copy} className="btn-secondary !py-1.5 !px-3 text-xs">
          {copied ? "Kopyalandi!" : "Kopyala"}
        </button>
      </div>
    </Modal>
  );
}
