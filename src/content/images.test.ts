import { describe, expect, it } from "vitest";
import { imageDataUri, images, resolveLibraryImages } from "./images";
import { buildPreviewDocument } from "@/lib/preview/buildDocument";
import { buildStandaloneHtml } from "@/lib/export/site";

describe("библиотека картинок", () => {
  it("12 картинок с уникальными именами, корректный SVG", () => {
    expect(images).toHaveLength(12);
    expect(new Set(images.map((i) => i.name)).size).toBe(12);
    for (const img of images) {
      expect(img.svg.startsWith("<svg") && img.svg.endsWith("</svg>"), img.name).toBe(true);
      expect(imageDataUri(img)).toMatch(/^data:image\/svg\+xml;base64,/);
    }
  });

  it("подставляет картинки вместо kartinki/имя.svg, неизвестные не трогает", () => {
    const out = resolveLibraryImages('<img src="kartinki/kot.svg"> <img src="./kartinki/myach.svg"> <img src="kartinki/net-takoj.svg">');
    expect(out.match(/data:image\/svg\+xml;base64,/g)).toHaveLength(2);
    expect(out).toContain("kartinki/net-takoj.svg");
  });

  it("картинки работают в предпросмотре (CSP разрешает data:) и в скачанном сайте", () => {
    const files = { html: '<img src="kartinki/raketa.svg" alt="Ракета">', css: "", js: "" };
    const built = buildPreviewDocument(files, { token: "t" });
    expect(built.html).toContain('src="data:image/svg+xml;base64,');
    expect(built.html).toContain("img-src data:");
    expect(buildStandaloneHtml("Сайт", files)).toContain('src="data:image/svg+xml;base64,');
  });
});
