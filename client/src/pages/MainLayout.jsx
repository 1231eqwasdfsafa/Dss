import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useAppStore } from "../store/appStore";
import { getSocket } from "../lib/socket";
import { DEMO_MODE } from "../lib/demo";
import { ArrowLeft } from "../components/Icons.jsx";
import useIsMobile from "../hooks/useIsMobile";

import ServerRail from "../components/ServerRail.jsx";
import ChannelSidebar from "../components/ChannelSidebar.jsx";
import ServerChannelList from "../components/ServerChannelList.jsx";
import DmList from "../components/DmList.jsx";
import ChatArea from "../components/ChatArea.jsx";
import MemberList from "../components/MemberList.jsx";
import DiscoverPage from "../components/DiscoverPage.jsx";
import MobileTabBar from "../components/MobileTabBar.jsx";
import MobileServerList from "../components/MobileServerList.jsx";
import MobileAccountScreen from "../components/MobileAccountScreen.jsx";

import CreateServerModal from "../components/modals/CreateServerModal.jsx";
import JoinServerModal from "../components/modals/JoinServerModal.jsx";
import CreateChannelModal from "../components/modals/CreateChannelModal.jsx";
import InviteModal from "../components/modals/InviteModal.jsx";
import NewDmModal from "../components/modals/NewDmModal.jsx";
import SettingsModal from "../components/modals/SettingsModal.jsx";
import CreatePollModal from "../components/modals/CreatePollModal.jsx";
import ReportModal from "../components/modals/ReportModal.jsx";
import ReportsModal from "../components/modals/ReportsModal.jsx";

export default function MainLayout() {
  const { user, setPresence: setOwnPresence } = useAuthStore();
  const isMobile = useIsMobile();
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
    selectDiscover,
    createPoll,
    votePoll,
    reportMessage,
  } = useAppStore();

  const [modal, setModal] = useState(null); // 'createServer' | 'joinServer' | 'createChannel' | 'invite' | 'newDm' | 'settings' | 'createPoll' | 'reports'
  const [membersOpen, setMembersOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null); // messageId being reported

  // Mobile-only navigation stack: which tab's root list is showing, and how
  // deep the drill-down goes (list -> channel list -> chat), independent of
  // the desktop layout which shows everything at once.
  const [mobileTab, setMobileTab] = useState("servers"); // 'dm' | 'servers' | 'discover' | 'account'
  const [mobileScreen, setMobileScreen] = useState("tabs"); // 'tabs' | 'channelList' | 'chat'

  useEffect(() => {
    fetchServers();
    fetchDms();
  }, []);

  // Auto-select first server + channel once loaded (desktop shows it right
  // away; mobile just has it ready for when the user drills in)
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
    const onPresence = ({ userId, status }) => {
      setPresence(userId, status);
      setOwnPresence(userId, status);
    };
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
    setMobileScreen("tabs");
  }

  async function handleStartDm(userInfo) {
    const dm = await startDm(userInfo);
    selectDm(dm.id);
    if (isMobile) {
      setMobileTab("dm");
      setMobileScreen("chat");
    }
  }

  function handleReportMessage(messageId) {
    setReportTarget(messageId);
  }

  async function handleCreatePoll(question, options) {
    if (!activeChannel) return;
    await createPoll(activeChannel.id, question, options);
  }

  const sharedModals = (
    <>
      {modal === "createPoll" && activeChannel && (
        <CreatePollModal onClose={() => setModal(null)} onCreate={(question, options) => handleCreatePoll(question, options)} />
      )}
      {modal === "reports" && activeServer && <ReportsModal serverId={activeServer.id} onClose={() => setModal(null)} />}
      {modal === "createServer" && <CreateServerModal onClose={() => setModal(null)} onCreate={createServer} />}
      {modal === "joinServer" && <JoinServerModal onClose={() => setModal(null)} onJoin={joinServer} />}
      {modal === "createChannel" && activeServer && (
        <CreateChannelModal onClose={() => setModal(null)} onCreate={(name, type) => createChannel(activeServer.id, name, type)} />
      )}
      {modal === "invite" && activeServer && <InviteModal server={activeServer} onClose={() => setModal(null)} />}
      {modal === "newDm" && <NewDmModal onClose={() => setModal(null)} onStart={handleStartDm} />}
      {modal === "settings" && <SettingsModal onClose={() => setModal(null)} />}
      {reportTarget && (
        <ReportModal
          onClose={() => setReportTarget(null)}
          onSubmit={async (reason) => {
            await reportMessage(reportTarget, reason);
            setReportTarget(null);
          }}
        />
      )}
    </>
  );

  const chatProps = {
    currentUserId: user.id,
    onEdit: handleEditMessage,
    onDelete: handleDeleteMessage,
    onReact: toggleReaction,
    onReport: handleReportMessage,
    onVotePoll: votePoll,
    onSend: sendMessage,
    onTypingStart: typingStart,
    onTypingStop: typingStop,
  };

  if (isMobile) {
    return (
      <div className="h-screen w-screen flex flex-col bg-base-900 overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col">
          {mobileScreen === "tabs" && mobileTab === "dm" && (
            <DmList
              dms={dms}
              activeDmId={activeDmId}
              onSelectDm={(id) => { selectDm(id); setMobileScreen("chat"); }}
              onNewDm={() => setModal("newDm")}
              presence={presence}
            />
          )}

          {mobileScreen === "tabs" && mobileTab === "servers" && (
            <MobileServerList
              servers={servers}
              onSelect={(id) => { selectServer(id); setMobileScreen("channelList"); }}
              onCreate={() => setModal("createServer")}
              onJoin={() => setModal("joinServer")}
            />
          )}

          {mobileScreen === "tabs" && mobileTab === "discover" && (
            <DiscoverPage
              onJoined={(server) => {
                selectServer(server.id);
                setMobileTab("servers");
                setMobileScreen("channelList");
              }}
            />
          )}

          {mobileScreen === "tabs" && mobileTab === "account" && <MobileAccountScreen onOpenSettings={() => setModal("settings")} />}

          {mobileScreen === "channelList" && activeServer && (
            <ServerChannelList
              server={activeServer}
              activeChannelId={activeChannelId}
              onSelectChannel={(id) => { selectChannel(id); setMobileScreen("chat"); }}
              onCreateChannel={() => setModal("createChannel")}
              onOpenInvite={() => setModal("invite")}
              onOpenReports={() => setModal("reports")}
              onLeaveOrDelete={handleLeaveOrDelete}
              headerLeft={<BackBtn onClick={() => setMobileScreen("tabs")} />}
            />
          )}

          {mobileScreen === "chat" && mobileTab === "servers" && activeChannel && (
            <div className="relative flex-1 flex min-w-0">
              <ChatArea
                {...chatProps}
                title={activeChannel.name}
                type={activeChannel.type}
                messages={messagesByChannel[activeChannelId] || []}
                canModerate={canModerate}
                typingUsers={typing[activeChannelId]}
                onOpenPoll={activeChannel.type === "TEXT" ? () => setModal("createPoll") : null}
                showMemberToggle
                membersOpen={membersOpen}
                onToggleMembers={() => setMembersOpen((v) => !v)}
                headerLeft={<BackBtn onClick={() => setMobileScreen("channelList")} />}
              />
              {activeServer && (
                <MemberList open={membersOpen} onClose={() => setMembersOpen(false)} members={members} presence={presence} onStartDm={handleStartDm} />
              )}
            </div>
          )}

          {mobileScreen === "chat" && mobileTab === "dm" && activeDm && (
            <ChatArea
              {...chatProps}
              title={activeDm.user?.username || "Bilinmeyen"}
              type="TEXT"
              messages={messagesByDm[activeDmId] || []}
              canModerate={false}
              typingUsers={typing[activeDmId]}
              emptyHint="Sohbete baslamak icin bir mesaj gonder."
              headerLeft={<BackBtn onClick={() => setMobileScreen("tabs")} />}
            />
          )}
        </div>

        {mobileScreen === "tabs" && (
          <MobileTabBar
            active={mobileTab}
            onChange={(tab) => {
              setMobileTab(tab);
              setMobileScreen("tabs");
            }}
            onCreate={() => setModal("createServer")}
          />
        )}

        {sharedModals}
      </div>
    );
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
        onDiscover={selectDiscover}
        onOpenSettings={() => setModal("settings")}
      />

      {view !== "discover" && (
        <ChannelSidebar
          view={view}
          server={activeServer}
          activeChannelId={activeChannelId}
          onSelectChannel={selectChannel}
          onCreateChannel={() => setModal("createChannel")}
          onOpenInvite={() => setModal("invite")}
          onLeaveOrDelete={handleLeaveOrDelete}
          dms={dms}
          activeDmId={activeDmId}
          onSelectDm={selectDm}
          onNewDm={() => setModal("newDm")}
          presence={presence}
          onOpenReports={() => setModal("reports")}
        />
      )}

      {view === "discover" ? (
        <DiscoverPage onJoined={(server) => selectServer(server.id)} />
      ) : (
        <div className="relative flex-1 flex min-w-0">
          {view === "server" ? (
            activeChannel ? (
              <ChatArea
                {...chatProps}
                title={activeChannel.name}
                type={activeChannel.type}
                messages={messagesByChannel[activeChannelId] || []}
                canModerate={canModerate}
                typingUsers={typing[activeChannelId]}
                onOpenPoll={activeChannel.type === "TEXT" ? () => setModal("createPoll") : null}
                showMemberToggle
                membersOpen={membersOpen}
                onToggleMembers={() => setMembersOpen((v) => !v)}
              />
            ) : (
              <EmptyState text={activeServer ? "Bir kanal sec" : "Baslamak icin bir sunucu olustur ya da katil"} />
            )
          ) : activeDm ? (
            <ChatArea
              {...chatProps}
              title={activeDm.user?.username || "Bilinmeyen"}
              type="TEXT"
              messages={messagesByDm[activeDmId] || []}
              canModerate={false}
              typingUsers={typing[activeDmId]}
              emptyHint="Sohbete baslamak icin bir mesaj gonder."
            />
          ) : (
            <EmptyState text="Sohbete baslamak icin bir arkadas sec" />
          )}

          {view === "server" && activeServer && (
            <MemberList open={membersOpen} onClose={() => setMembersOpen(false)} members={members} presence={presence} onStartDm={handleStartDm} />
          )}
        </div>
      )}

      {sharedModals}
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="w-8 h-8 -ml-1 flex items-center justify-center text-gray-400 hover:text-ink shrink-0">
      <ArrowLeft size={20} />
    </button>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex-1 flex items-center justify-center text-gray-500 bg-base-750 px-6 text-center">
      <p>{text}</p>
    </div>
  );
}
