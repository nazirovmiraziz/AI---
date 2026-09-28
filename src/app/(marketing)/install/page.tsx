import type { Metadata } from "next";
import { PageChrome } from "@/components/PageChrome";
import { InstallApp } from "@/components/InstallApp";

export const metadata: Metadata = {
  title: "На телефон — Micro AI School",
  description: "Добавь школу на экран Домой. Тот же сайт, без магазина приложений.",
  alternates: { canonical: "/install" },
};

export default function InstallPage() {
  return (
    <PageChrome id="install">
      <div className="fit-center mx-auto max-w-2xl">
        <img src="/logo-mark.svg" alt="" className="mx-auto h-12 w-12 sm:h-16 sm:w-16 rounded-[28%]" />
        <h1 className="mt-3 text-center font-semibold">Школа всегда с тобой</h1>
        <p className="mt-2 text-center page-lead">Поставь на экран. Это тот же сайт, без магазина приложений.</p>
        <div className="mt-4 sm:mt-5">
          <InstallApp compact />
        </div>
        <ol className="mt-4 grid gap-2 text-start text-sm sm:grid-cols-3">
          <li className="lift-card rounded-xl p-3">
            <b className="block">Android</b>
            Chrome → меню → «На экран».
          </li>
          <li className="lift-card rounded-xl p-3">
            <b className="block">iPhone</b>
            Safari → Поделиться → «На экран Домой».
          </li>
          <li className="lift-card rounded-xl p-3">
            <b className="block">Компьютер</b>
            В адресной строке — значок установки, если браузер умеет.
          </li>
        </ol>
      </div>
    </PageChrome>
  );
}
