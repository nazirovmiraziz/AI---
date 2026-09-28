export const SITE_PAGES = [
  { href: "/", id: "home", label: "Главная", num: "01" },
  { href: "/how", id: "how", label: "Как работает", num: "02" },
  { href: "/method", id: "method", label: "Метод", num: "03" },
  { href: "/program", id: "program", label: "Предметы", num: "04" },
  { href: "/install", id: "install", label: "На телефон", num: "05" },
] as const;

export const SCHOOL_SECTIONS = [
  { href: "/", title: "Главная", text: "Продукт: репетитор, кабинет и метод.", group: "Сайт" },
  { href: "/how", title: "Как работает", text: "От вопроса до понимания.", group: "Сайт" },
  { href: "/method", title: "Метод", text: "Восемь шагов репетитора.", group: "Сайт" },
  { href: "/program", title: "Предметы", text: "Школьные предметы и языки.", group: "Сайт" },
  { href: "/install", title: "На телефон", text: "Добавь школу на экран Домой.", group: "Сайт" },
  { href: "/login", title: "Войти", text: "Свой аккаунт или демо.", group: "Сайт" },
  { href: "/tutor", title: "Репетитор", text: "Диалог без готового ответа.", group: "Кабинет", app: true },
  { href: "/dashboard", title: "Главная", text: "Что повторить сегодня.", group: "Кабинет", app: true },
  { href: "/tests", title: "Проверка", text: "Короткий тест по теме.", group: "Кабинет", app: true },
  { href: "/exam", title: "Экзамен", text: "Тихий режим с таймером.", group: "Кабинет", app: true },
  { href: "/photo", title: "Фото", text: "Снимок и шаги.", group: "Кабинет", app: true },
  { href: "/plan", title: "План", text: "30 дней до экзамена.", group: "Кабинет", app: true },
  { href: "/library", title: "Библиотека", text: "Школьные темы по предметам.", group: "Кабинет", app: true },
  { href: "/settings", title: "Настройки", text: "Язык и подсказки.", group: "Кабинет", app: true },
] as const;
