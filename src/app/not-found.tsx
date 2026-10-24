import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">Такой страницы нет</h1>
      <p className="text-[17px]">Возможно, в адресе опечатка. Маршрут уроков — на главной.</p>
      <Link href="/" className="rounded-xl bg-route px-6 py-3 font-semibold text-white">
        Открыть маршрут
      </Link>
    </main>
  );
}
