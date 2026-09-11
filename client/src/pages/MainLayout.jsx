import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useAppStore } from "../store/appStore";
import { getSocket } from "../lib/socket";
import { DEMO_MODE } from "../lib/demo";

import ServerRail from "../components/ServerRail.jsx";
import ChannelSidebar from "../components/ChannelSidebar.jsx";
import ChatArea from "../components/ChatArea.jsx";
import MemberList from "../components/MemberList.jsx";

import CreateServerModal from "../components/modals/CreateServerModal.jsx";
import JoinServerModal from "../components/modals/JoinServerModal.jsx";
import CreateChannelModal from "../components/modals/CreateChannelModal.jsx";
import InviteModal from "../components/modals/InviteModal.jsx";
import NewDmModal from "../components/modals/NewDmModal.jsx";
import SettingsModal from "../components/modals/SettingsModal.jsx";

export default function MainLayout() {
  const { user } = useAuthStore();
  const {
    servers,
    activeServerId,
    activeChannelId,
    membersByServer,
    messagesByChannel,
    dms,
    activeDmId,
    messagesByDm,
    presence,
    typing,
    view,
    fetchServers,
    fetchDms,
    selectServer,
    selectChannel,
    selectDm,
    fetchMembers,
    addMemberToStore,
    fetchMessages,
    fetchDmMessages,
    createServer,
    joinServer,
    createChannel,
    leaveServer,
    deleteServer,
    startDm,
    receiveMessage,
    updateMessageInStore,
    removeMessageFromStore,
    deleteMessage,
    editMessage,
    toggleReaction,
    setPresence,
    setTyping,
    clearTyping,
    sendDemoMessage,
  } = useAppStore();

  const [modal, setModal] = useState(null); // 'createServer' | 'joinServer' | 'createChannel' | 'invite' | 'newDm' | 'settings'

  useEffect(() => {
    fetchServers();
    fetchDms();
  }, []);

  // Auto-select first server + channel once loaded
  useEffect(() => {
    if (!activeServerId && !activeDmId && servers.length > 0) {
      const first = servers[0];
      selectServer(first.id);
      const firstText = first.channels.find((c) => c.type === "TEXT");
      if (firstText) selectChannel(firstText.id);
    }
  }, [servers]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onNew = (msg) => receiveMessage(msg);
    const onUpdate = (msg) => updateMessageInStore(msg);
    const onDelete = ({ messageId }) => {
      removeMessageFromStore(messageId, activeChannelId, activeDmId);
    };
    const onPresence = ({ userId, status }) => setPresence(userId, status);
    const onMemberJoined = ({ serverId, member }) => addMemberToStore(serverId, member);
    const onTypingStart = ({ userId, username, channelId, dmChannelId }) => {
      setTyping(channelId || dmChannelId, userId, username);
    };
    const onTypingStop = ({ userId, channelId, dmChannelId }) => {
      clearTyping(channelId || dmChannelId, userId);
    };

    socket.on("message:new", onNew);
    socket.on("message:update", onUpdate);
    socket.on("message:delete", onDelete);
    socket.on("presence:update", onPresence);
    socket.on("member:joined", onMemberJoined);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);

    return () => {
      socket.off("message:new", onNew);
      socket.off("message:update", onUpdate);
      socket.off("message:delete", onDelete);
      socket.off("presence:update", onPresence);
      socket.off("member:joined", onMemberJoined);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
    };
  }, [activeChannelId, activeDmId]);

  useEffect(() => {
    if (activeServerId) fetchMembers(activeServerId);
  }, [activeServerId]);

  useEffect(() => {
    const socket = getSocket();
    if (!activeChannelId) return;
    socket?.emit("channel:join", activeChannelId);
    if (!messagesByChannel[activeChannelId]) fetchMessages(activeChannelId);
    return () => socket?.emit("channel:leave", activeChannelId);
  }, [activeChannelId]);

  useEffect(() => {
    if (!activeDmId) return;
    if (!messagesByDm[activeDmId]) fetchDmMessages(activeDmId);
  }, [activeDmId]);

  const activeServer = servers.find((s) => s.id === activeServerId);
  const activeChannel = activeServer?.channels.find((c) => c.id === activeChannelId);
  const activeDm = dms.find((d) => d.id === activeDmId);
  const members = membersByServer[activeServerId] || [];
  const canModerate = activeServer?.myRole === "OWNER" || activeServer?.myRole === "ADMIN";

  function sendMessage(content) {
    if (DEMO_MODE) {
      if (view === "server" && activeChannelId) sendDemoMessage(content, { channelId: activeChannelId });
      else if (view === "dm" && activeDmId) sendDemoMessage(content, { dmChannelId: activeDmId });
      return;
    }
    const socket = getSocket();
    if (view === "server" && activeChannelId) {
      socket.emit("message:send", { channelId: activeChannelId, content });
    } else if (view === "dm" && activeDmId) {
      socket.emit("message:send", { dmChannelId: activeDmId, content });
    }
  }

  function typingStart() {
    if (DEMO_MODE) return;
    const socket = getSocket();
    if (view === "server" && activeChannelId) {
      socket.emit("typing:start", { channelId: activeChannelId, username: user.username });
    } else if (view === "dm" && activeDmId) {
      socket.emit("typing:start", { dmChannelId: activeDmId, username: user.username });
    }
  }

  function typingStop() {
    if (DEMO_MODE) return;
    const socket = getSocket();
    if (view === "server" && activeChannelId) {
      socket.emit("typing:stop", { channelId: activeChannelId });
    } else if (view === "dm" && activeDmId) {
      socket.emit("typing:stop", { dmChannelId: activeDmId });
    }
  }

  async function handleDeleteMessage(messageId) {
    await deleteMessage(messageId);
    removeMessageFromStore(messageId, activeChannelId, activeDmId);
    if (DEMO_MODE) return;
    getSocket().emit("message:delete", { messageId, channelId: activeChannelId, dmChannelId: activeDmId });
  }

  async function handleEditMessage(messageId, content) {
    await editMessage(messageId, content);
    if (DEMO_MODE) return;
    const socket = getSocket();
    const list = activeChannelId ? messagesByChannel[activeChannelId] : messagesByDm[activeDmId];
    const updated = list?.find((m) => m.id === messageId);
    if (updated) socket.emit("message:update", { ...updated, content, edited: true });
  }

  async function handleLeaveOrDelete() {
    if (!activeServer) return;
    const isOwner = activeServer.myRole === "OWNER";
    const confirmed = window.confirm(
      isOwner ? `"${activeServer.name}" sunucusunu kalici olarak silmek istedigine emin misin?` : `"${activeServer.name}" sunucusundan ayrilmak istedigine emin misin?`
    );
    if (!confirmed) return;
    if (isOwner) await deleteServer(activeServer.id);
    else await leaveServer(activeServer.id);
  }

  async function handleStartDm(userInfo) {
    const dm = await startDm(userInfo);
    selectDm(dm.id);
  }

  return (
    <div className="h-screen w-screen flex bg-base-900 overflow-hidden">
      <ServerRail
        servers={servers}
        activeServerId={activeServerId}
        view={view}
        onSelectServer={selectServer}
        onSelectHome={() => selectDm(activeDmId || dms[0]?.id || null)}
        onCreate={() => setModal("createServer")}
        onJoin={() => setModal("joinServer")}
      />

      <ChannelSidebar
        view={view}
        server={activeServer}
        activeChannelId={activeChannelId}
        onSelectChannel={selectChannel}
        onOpenSettings={() => setModal("settings")}
        onCreateChannel={() => setModal("createChannel")}
        onOpenInvite={() => setModal("invite")}
        onLeaveOrDelete={handleLeaveOrDelete}
        currentUserId={user.id}
        dms={dms}
        activeDmId={activeDmId}
        onSelectDm={selectDm}
        onNewDm={() => setModal("newDm")}
        presence={presence}
      />

      {view === "server" ? (
        activeChannel ? (
          <ChatArea
            title={activeChannel.name}
            type={activeChannel.type}
            messages={messagesByChannel[activeChannelId] || []}
            currentUserId={user.id}
            canModerate={canModerate}
            onSend={sendMessage}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
            onReact={toggleReaction}
            onTypingStart={typingStart}
            onTypingStop={typingStop}
            typingUsers={typing[activeChannelId]}
          />
        ) : (
          <EmptyState text={activeServer ? "Bir kanal sec" : "Baslamak icin bir sunucu olustur ya da katil"} />
        )
      ) : activeDm ? (
        <ChatArea
          title={activeDm.user?.username || "Bilinmeyen"}
          type="TEXT"
          messages={messagesByDm[activeDmId] || []}
          currentUserId={user.id}
          canModerate={false}
          onSend={sendMessage}
          onEdit={handleEditMessage}
          onDelete={handleDeleteMessage}
          onReact={toggleReaction}
          onTypingStart={typingStart}
          onTypingStop={typingStop}
          typingUsers={typing[activeDmId]}
          emptyHint="Sohbete baslamak icin bir mesaj gonder."
        />
      ) : (
        <EmptyState text="Sohbete baslamak icin bir arkadas sec" />
      )}

      {view === "server" && activeServer && <MemberList members={members} presence={presence} onStartDm={handleStartDm} />}

      {modal === "createServer" && <CreateServerModal onClose={() => setModal(null)} onCreate={createServer} />}
      {modal === "joinServer" && <JoinServerModal onClose={() => setModal(null)} onJoin={joinServer} />}
      {modal === "createChannel" && activeServer && (
        <CreateChannelModal onClose={() => setModal(null)} onCreate={(name, type) => createChannel(activeServer.id, name, type)} />
      )}
      {modal === "invite" && activeServer && <InviteModal server={activeServer} onClose={() => setModal(null)} />}
      {modal === "newDm" && <NewDmModal onClose={() => setModal(null)} onStart={handleStartDm} />}
      {modal === "settings" && <SettingsModal onClose={() => setModal(null)} />}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex-1 flex items-center justify-center text-gray-500 bg-base-750">
      <p>{text}</p>
    </div>
  );
}
