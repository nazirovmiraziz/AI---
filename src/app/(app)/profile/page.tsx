"use client";

import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { ProgressBar } from "@/components/ProgressBar";
import { SUBJECTS } from "@/lib/subjects";

export default function ProfilePage() {
  const { user } = useApp();
  const loc = user?.language ?? "ru";
  const strong = [...SUBJECTS].sort((a, b) => (user?.subjectLevels[b.id] ?? 0) - (user?.subjectLevels[a.id] ?? 0))[0];
  const weak = [...SUBJECTS].sort((a, b) => (user?.subjectLevels[a.id] ?? 0) - (user?.subjectLevels[b.id] ?? 0))[0];
  return (
    <div className="max-w-2xl space-y-6 pb-16">
      <h1 className="font-serif text-4xl">👤 {t(loc, "profile.progress")}</h1>
      <div className="rounded-3xl border border-[var(--line)] bg-white dark:bg-ink-900 p-6 space-y-4">
        <div className="text-2xl font-medium">{user?.name}</div>
        <Row k={t(loc, "profile.goal")} v={t(loc, `goal.${user?.goal ?? "university"}`)} />
        <Row k={t(loc, "profile.streak")} v={`🔥 ${user?.streak} ${t(loc, "days")}`} />
        <Row k={t(loc, "profile.xp")} v={(user?.xp ?? 0).toLocaleString("ru-RU")} />
        <Row k={t(loc, "profile.learned")} v={`${user?.learnedTopics.length ?? 0} ${t(loc, "profile.topics")}`} />
        <Row k={t(loc, "profile.strong")} v={`🟢 ${t(loc, `subject.${strong.id}`)}`} />
        <Row k={t(loc, "profile.repeat")} v={`🟠 ${t(loc, `subject.${weak.id}`)}`} />
      </div>
      <div className="rounded-3xl border border-[var(--line)] bg-white dark:bg-ink-900 p-6">
        <h2 className="font-medium mb-3">{t(loc, "nav.history")}</h2>
        <div className="space-y-3">
          {(user?.testHistory ?? []).map((h) => (
            <div key={h.id} className="text-sm">
              <div className="flex justify-between">
                <span>{h.title}</span>
                <span>
                  {h.score}/{h.total}
                </span>
              </div>
              <ProgressBar value={(h.score / h.total) * 100} className="mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-ink-500">{k}</span>
      <span className="font-medium text-end">{v}</span>
    </div>
  );
}
