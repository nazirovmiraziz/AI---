export default function NotFound() {
  return (
    <div className="min-h-[50vh] grid place-items-center p-8 text-center">
      <div>
        <h1 className="font-serif text-4xl">Страница не найдена</h1>
        <p className="text-ink-500 mt-2">Вернитесь на главную и продолжите обучение.</p>
        <a href="/dashboard" className="text-brand-700 mt-4 inline-block">
          На главную
        </a>
      </div>
    </div>
  );
}
