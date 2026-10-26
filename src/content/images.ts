/**
 * Библиотека картинок для детских сайтов.
 *
 * Внешние картинки в предпросмотре запрещены (CSP), и так и останется: нельзя
 * случайно загрузить что-то неподходящее для ребёнка или «следящий» пиксель.
 * Ребёнок пишет короткий адрес <img src="kartinki/kot.svg">, а студия при сборке
 * предпросмотра и при скачивании сайта подставляет картинку из этого набора.
 * Все картинки нарисованы для студии кодом (SVG), только латиница внутри — для base64.
 */
export type LibraryImage = { name: string; title: string; svg: string };

const wrap = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">${body}</svg>`;

export const images: LibraryImage[] = [
  {
    name: "kot",
    title: "Кот",
    svg: wrap(
      '<path d="M30 48 L36 18 L52 38 Z M90 48 L84 18 L68 38 Z" fill="#f59f00"/><circle cx="60" cy="62" r="34" fill="#f59f00"/>' +
        '<circle cx="47" cy="58" r="5" fill="#1b2440"/><circle cx="73" cy="58" r="5" fill="#1b2440"/>' +
        '<path d="M56 70 L64 70 L60 75 Z" fill="#e8590c"/><path d="M60 75 Q54 82 48 78 M60 75 Q66 82 72 78" stroke="#1b2440" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M30 70 L14 66 M30 75 L14 78 M90 70 L106 66 M90 75 L106 78" stroke="#1b2440" stroke-width="2" stroke-linecap="round"/>',
    ),
  },
  {
    name: "sobaka",
    title: "Собака",
    svg: wrap(
      '<ellipse cx="30" cy="56" rx="12" ry="24" fill="#8d5524"/><ellipse cx="90" cy="56" rx="12" ry="24" fill="#8d5524"/>' +
        '<circle cx="60" cy="62" r="32" fill="#d9a066"/><ellipse cx="60" cy="78" rx="16" ry="12" fill="#f1d3ad"/>' +
        '<circle cx="48" cy="56" r="5" fill="#1b2440"/><circle cx="72" cy="56" r="5" fill="#1b2440"/>' +
        '<ellipse cx="60" cy="72" rx="7" ry="5" fill="#1b2440"/><path d="M60 77 L60 84 M54 86 Q60 90 66 86" stroke="#1b2440" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
    ),
  },
  {
    name: "myach",
    title: "Мяч",
    svg: wrap(
      '<circle cx="60" cy="60" r="44" fill="#ffffff" stroke="#1b2440" stroke-width="4"/>' +
        '<path d="M60 40 L78 53 L71 74 L49 74 L42 53 Z" fill="#1b2440"/>' +
        '<path d="M60 40 L60 18 M78 53 L99 46 M71 74 L84 93 M49 74 L36 93 M42 53 L21 46" stroke="#1b2440" stroke-width="4" stroke-linecap="round"/>',
    ),
  },
  {
    name: "raketa",
    title: "Ракета",
    svg: wrap(
      '<path d="M60 10 C80 28 82 60 74 84 L46 84 C38 60 40 28 60 10 Z" fill="#e9ecef" stroke="#1b2440" stroke-width="3"/>' +
        '<circle cx="60" cy="46" r="10" fill="#4dabf7" stroke="#1b2440" stroke-width="3"/>' +
        '<path d="M46 70 L30 90 L46 84 Z M74 70 L90 90 L74 84 Z" fill="#fa5252"/><path d="M50 86 Q60 112 70 86 Z" fill="#fab005"/>',
    ),
  },
  {
    name: "zvezda",
    title: "Звезда",
    svg: wrap(
      '<path d="M60 12 L73 45 L108 47 L81 69 L90 104 L60 85 L30 104 L39 69 L12 47 L47 45 Z" fill="#fcc419" stroke="#e67700" stroke-width="3" stroke-linejoin="round"/>',
    ),
  },
  {
    name: "kniga",
    title: "Книга",
    svg: wrap(
      '<path d="M16 30 Q38 22 60 32 Q82 22 104 30 L104 92 Q82 84 60 94 Q38 84 16 92 Z" fill="#ffffff" stroke="#1b2440" stroke-width="3"/>' +
        '<path d="M60 32 L60 94" stroke="#1b2440" stroke-width="3"/>' +
        '<path d="M26 44 L50 44 M26 54 L50 54 M26 64 L46 64 M70 44 L94 44 M70 54 L94 54 M70 64 L90 64" stroke="#5c7cfa" stroke-width="3" stroke-linecap="round"/>',
    ),
  },
  {
    name: "nota",
    title: "Нота",
    svg: wrap(
      '<path d="M48 84 L48 26 L92 16 L92 74" stroke="#7048e8" stroke-width="7" fill="none" stroke-linejoin="round"/>' +
        '<ellipse cx="38" cy="86" rx="14" ry="10" fill="#7048e8"/><ellipse cx="82" cy="76" rx="14" ry="10" fill="#7048e8"/>',
    ),
  },
  {
    name: "kraski",
    title: "Краски",
    svg: wrap(
      '<path d="M60 14 C92 14 110 38 104 60 C100 74 84 70 78 80 C72 92 84 106 64 106 C34 106 14 84 14 60 C14 34 34 14 60 14 Z" fill="#f8f0e3" stroke="#1b2440" stroke-width="3"/>' +
        '<circle cx="40" cy="44" r="8" fill="#fa5252"/><circle cx="62" cy="34" r="8" fill="#fab005"/><circle cx="84" cy="46" r="8" fill="#40c057"/>' +
        '<circle cx="34" cy="68" r="8" fill="#4dabf7"/><circle cx="50" cy="88" r="8" fill="#be4bdb"/>',
    ),
  },
  {
    name: "dzhojstik",
    title: "Джойстик",
    svg: wrap(
      '<path d="M22 46 Q22 34 36 34 L84 34 Q98 34 98 46 L104 80 Q106 94 92 92 L78 76 L42 76 L28 92 Q14 94 16 80 Z" fill="#495057"/>' +
        '<path d="M36 50 L36 66 M28 58 L44 58" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="80" cy="52" r="5" fill="#fa5252"/><circle cx="90" cy="62" r="5" fill="#40c057"/>',
    ),
  },
  {
    name: "cvetok",
    title: "Цветок",
    svg: wrap(
      '<path d="M60 64 L60 108" stroke="#2f9e44" stroke-width="5"/><path d="M60 92 Q40 84 36 70 Q54 72 60 92 Z" fill="#40c057"/>' +
        '<circle cx="60" cy="26" r="14" fill="#f783ac"/><circle cx="82" cy="44" r="14" fill="#f783ac"/><circle cx="74" cy="68" r="14" fill="#f783ac"/>' +
        '<circle cx="46" cy="68" r="14" fill="#f783ac"/><circle cx="38" cy="44" r="14" fill="#f783ac"/><circle cx="60" cy="48" r="11" fill="#fcc419"/>',
    ),
  },
  {
    name: "solnce",
    title: "Солнце",
    svg: wrap(
      '<g stroke="#f59f00" stroke-width="6" stroke-linecap="round"><path d="M60 8 L60 22 M60 98 L60 112 M8 60 L22 60 M98 60 L112 60 M23 23 L33 33 M87 87 L97 97 M23 97 L33 87 M87 33 L97 23"/></g>' +
        '<circle cx="60" cy="60" r="28" fill="#fcc419"/>',
    ),
  },
  {
    name: "dom",
    title: "Дом",
    svg: wrap(
      '<path d="M16 56 L60 18 L104 56" fill="#fa5252" stroke="#c92a2a" stroke-width="4" stroke-linejoin="round"/>' +
        '<rect x="26" y="54" width="68" height="50" fill="#ffd8a8" stroke="#1b2440" stroke-width="3"/>' +
        '<rect x="52" y="74" width="16" height="30" fill="#8d5524"/><rect x="34" y="64" width="14" height="14" fill="#74c0fc"/><rect x="72" y="64" width="14" height="14" fill="#74c0fc"/>',
    ),
  },
];

const byName = new Map(images.map((i) => [i.name, i]));

export function imageDataUri(img: LibraryImage): string {
  return `data:image/svg+xml;base64,${btoa(img.svg)}`;
}

/** Адрес, который пишет ребёнок. */
export const imagePath = (name: string) => `kartinki/${name}.svg`;

/**
 * Подставляет картинки из библиотеки вместо адресов kartinki/имя.svg (в HTML и CSS).
 * Неизвестные имена не трогаем — картинка не покажется, а студия подскажет в проверке.
 */
export function resolveLibraryImages(text: string): string {
  return text.replace(/(?:\.\/)?kartinki\/([a-z0-9-]+)\.svg/g, (whole, name: string) => {
    const img = byName.get(name);
    return img ? imageDataUri(img) : whole;
  });
}
