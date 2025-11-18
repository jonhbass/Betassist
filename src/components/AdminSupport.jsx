import React from 'react';
import '../css/admin.css';
import './admin-support/admin-support.css';
import ThreadList from './admin-support/ThreadList';
import ThreadView from './admin-support/ThreadView';
import useAdminSupport from './admin-support/useAdminSupport';

export default function AdminSupport() {
  const {
    replyText,
    setReplyText,
    listRef,
    activeThread,
    knownUsers,
    knownUsersFetched,
    threads,
    sendReply,
    openThread,
    markAllHandled,
    deleteThread,
  } = useAdminSupport();

  const activeObj = threads.find((t) => t.id === activeThread);

  return (
    <div className="ba-admin-support">
      <div
        className="ba-admin-support-grid"
        style={{ display: 'flex', gap: 12 }}
      >
        <ThreadList
          threads={threads}
          knownUsersFetched={knownUsersFetched}
          knownUsers={knownUsers}
          activeThread={activeThread}
          openThread={openThread}
          onDeleteThread={deleteThread}
        />
        <ThreadView
          activeThread={activeThread}
          activeObj={activeObj}
          listRef={listRef}
          replyText={replyText}
          setReplyText={setReplyText}
          sendReply={sendReply}
          markAllHandled={markAllHandled}
        />
      </div>
    </div>
  );
}
