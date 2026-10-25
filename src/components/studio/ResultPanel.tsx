"use client";

import type { MentorRequest } from "@/lib/mentor/client";
import { ConsolePanel, type ConsoleEntry } from "./ConsolePanel";
import { PreviewFrame } from "./PreviewFrame";
import type { PreviewSession } from "./usePreviewSession";

type Props = {
  session: PreviewSession;
  title: string;
  onRestart: () => void;
  onJumpToLine: (line: number) => void;
  /** дополнительные кнопки в шапке панели (например, «Скачать сайт») */
  actions?: React.ReactNode;
  mentorRequest?: (entry: ConsoleEntry) => MentorRequest;
};

/** Окно результата с консолью: одно и то же для уроков и своих проектов. */
export function ResultPanel({ session, title, onRestart, onJumpToLine, actions, mentorRequest }: Props) {
  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
        <h2 className="text-sm font-semibold text-muted">Результат</h2>
        <div className="flex items-center gap-1">
          {actions}
          <button
            type="button"
            onClick={onRestart}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-route hover:bg-route-soft"
          >
            Перезапустить
          </button>
        </div>
      </div>
      <PreviewFrame
        key={session.token}
        html={session.built.html}
        token={session.token}
        title={title}
        onMessage={session.handleMessage}
        onNavigationBlocked={session.onNavigationBlocked}
        className="min-h-0 w-full flex-1 bg-white"
      />
      <ConsolePanel entries={session.entries} onJumpToLine={onJumpToLine} mentorRequest={mentorRequest} />
    </>
  );
}
