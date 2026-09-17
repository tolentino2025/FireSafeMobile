import { describe, it, expect } from "vitest";

import {
  externalizePhotos,
  externalizePhotosInJson,
  inlineDataUri,
  isPhotoNode,
  mightContainInlinePhotos,
  PhotoBlobStore,
} from "../photoRefs";

const JPEG = (marker: string) => `data:image/jpeg;base64,AAAA${marker}`;

function memoryStore(): PhotoBlobStore & { data: Map<string, string>; failOn?: string } {
  const data = new Map<string, string>();
  return {
    data,
    async save(id, dataUri) {
      if (this.failOn === id) throw new Error("armazenamento indisponível");
      data.set(id, dataUri);
    },
    async read(id) {
      return data.get(id) ?? null;
    },
  };
}

function inspection(photos: unknown[]) {
  return [{ id: "insp-1", propertyName: "SABOARIA", photos, checklist: [] }];
}

describe("isPhotoNode", () => {
  it("reconhece as formas de foto", () => {
    expect(isPhotoNode({ id: "1", base64: JPEG("a"), caption: "" })).toBe(true);
    expect(isPhotoNode({ id: "1", uri: JPEG("a") })).toBe(true);
    expect(isPhotoNode({ id: "1", storagePath: "c/photos/1.jpg" })).toBe(true);
    expect(isPhotoNode({ id: "1", stored: true })).toBe(true);
  });

  it("não confunde outros registros com fotos", () => {
    // Empresa, item de checklist e assinatura (SVG em string) não são fotos.
    expect(isPhotoNode({ id: "c1", name: "Jonel", uri: "https://site" })).toBe(false);
    expect(isPhotoNode({ id: "i1", label: "Manômetro", value: "ok" })).toBe(false);
    expect(isPhotoNode({ signature: JPEG("a") })).toBe(false);
    expect(isPhotoNode(null)).toBe(false);
    expect(isPhotoNode(["id"])).toBe(false);
  });
});

describe("mightContainInlinePhotos", () => {
  it("dispara com foto embutida e ignora payload sem foto", () => {
    expect(mightContainInlinePhotos(JSON.stringify(inspection([{ id: "p1", base64: JPEG("a") }])))).toBe(true);
    expect(mightContainInlinePhotos(JSON.stringify(inspection([{ id: "p1", stored: true, uri: "" }])))).toBe(false);
  });

  it("não dispara com texto do usuário que menciona base64 ou data:", () => {
    const json = JSON.stringify([{ id: "1", observations: 'anotação "base64" e "data:" no texto' }]);
    expect(mightContainInlinePhotos(json)).toBe(false);
  });

  it("um falso positivo no filtro não altera o payload", async () => {
    const store = memoryStore();
    const json = JSON.stringify([{ id: "1", observations: 'colado da web: "data:image/jpeg"' }]);
    expect(await externalizePhotosInJson(json, store)).toBe(json);
    expect(store.data.size).toBe(0);
  });
});

describe("externalizePhotos", () => {
  it("move o binário e deixa só a referência no registro", async () => {
    const store = memoryStore();
    const root = inspection([{ id: "p1", uri: "blob:http://x/1", base64: JPEG("a"), caption: "manômetro" }]);

    const result = await externalizePhotos(root, store);

    expect(result).toEqual({ moved: 1, kept: 0 });
    expect(store.data.get("p1")).toBe(JPEG("a"));
    const photo = (root[0].photos as any[])[0];
    expect(photo.base64).toBeUndefined();
    expect(photo.uri).toBe(""); // blob: morre ao recarregar a página
    expect(photo.stored).toBe(true);
    expect(photo.caption).toBe("manômetro"); // o resto do nó fica intacto
  });

  it("encontra fotos em qualquer profundidade", async () => {
    const store = memoryStore();
    const root = {
      inspections: [
        {
          id: "i1",
          checklist: [{ id: "c1", photos: [{ id: "p1", base64: JPEG("a") }] }],
          hydrostaticTest: { signatures: {}, photoEvidence: { initialGaugePhotoIds: ["p2"] } },
          photos: [{ id: "p2", uri: JPEG("b") }],
        },
      ],
    };

    const { moved } = await externalizePhotos(root, store);

    expect(moved).toBe(2);
    expect([...store.data.keys()].sort()).toEqual(["p1", "p2"]);
  });

  it("é idempotente: rodar de novo não muda nada", async () => {
    const store = memoryStore();
    const root = inspection([{ id: "p1", base64: JPEG("a") }]);

    await externalizePhotos(root, store);
    const snapshot = JSON.stringify(root);
    const second = await externalizePhotos(root, store);

    expect(second).toEqual({ moved: 0, kept: 0 });
    expect(JSON.stringify(root)).toBe(snapshot);
  });

  it("aceita o mesmo id repetido quando o conteúdo é igual (cópia na fila de sync)", async () => {
    const store = memoryStore();
    const root = {
      inspections: [{ id: "p1", base64: JPEG("a") }],
      pending: [{ id: "p1", base64: JPEG("a") }],
    };

    const { moved, kept } = await externalizePhotos(root, store);

    expect({ moved, kept }).toEqual({ moved: 2, kept: 0 });
    expect(store.data.size).toBe(1);
  });

  it("não sobrescreve foto diferente com o mesmo id: mantém a segunda embutida", async () => {
    const store = memoryStore();
    const root = { a: [{ id: "p1", base64: JPEG("a") }], b: [{ id: "p1", base64: JPEG("DIFERENTE") }] };

    const { moved, kept } = await externalizePhotos(root, store);

    expect({ moved, kept }).toEqual({ moved: 1, kept: 1 });
    expect(store.data.get("p1")).toBe(JPEG("a"));
    expect((root.b as any[])[0].base64).toBe(JPEG("DIFERENTE")); // nada se perde
  });

  it("falha ao gravar mantém a foto no registro (nunca perde a imagem)", async () => {
    const store = memoryStore();
    store.failOn = "p1";
    const root = inspection([{ id: "p1", base64: JPEG("a"), uri: "blob:http://x/1" }]);

    const { moved, kept } = await externalizePhotos(root, store);

    expect({ moved, kept }).toEqual({ moved: 0, kept: 1 });
    const photo = (root[0].photos as any[])[0];
    expect(photo.base64).toBe(JPEG("a"));
    expect(photo.stored).toBeUndefined();
  });

  it("normaliza base64 sem prefixo para data URI", async () => {
    const store = memoryStore();
    await externalizePhotos(inspection([{ id: "p1", base64: "AAAAsempreﬁxo" }]), store);
    expect(store.data.get("p1")).toBe("data:image/jpeg;base64,AAAAsempreﬁxo");
  });

  it("trata image/jpg e image/jpeg como o mesmo conteúdo (foto legada migra)", async () => {
    const store = memoryStore();
    // Gravada antes com o rótulo normalizado; o registro antigo usa image/jpg.
    await store.save("p1", "data:image/jpeg;base64,AAA");
    const root = inspection([{ id: "p1", base64: "data:image/jpg;base64,AAA" }]);

    const { moved, kept } = await externalizePhotos(root, store);

    expect({ moved, kept }).toEqual({ moved: 1, kept: 0 });
    expect((root[0].photos as any[])[0].base64).toBeUndefined();
  });

  it("preserva o tipo da imagem (png não vira jpeg)", () => {
    expect(inlineDataUri({ id: "p", uri: "data:image/png;base64,ABC" })).toBe("data:image/png;base64,ABC");
  });
});

describe("externalizePhotosInJson", () => {
  it("devolve a mesma string quando não há nada a mover", async () => {
    const store = memoryStore();
    const json = JSON.stringify(inspection([{ id: "p1", stored: true, uri: "" }]));
    expect(await externalizePhotosInJson(json, store)).toBe(json);
  });

  it("encolhe o JSON gravado ao tirar as fotos", async () => {
    const store = memoryStore();
    const big = `data:image/jpeg;base64,${"A".repeat(600_000)}`;
    const json = JSON.stringify(inspection([{ id: "p1", base64: big }, { id: "p2", base64: big + "B" }]));

    const out = await externalizePhotosInJson(json, store);

    expect(out.length).toBeLessThan(json.length / 100);
    expect(out).not.toContain("data:image");
    expect(store.data.size).toBe(2);
  });

  it("não quebra com JSON inválido", async () => {
    const store = memoryStore();
    const broken = '{"photos":[{"id":"p1","base64":"data:image/jpeg;base64,AAA"';
    expect(await externalizePhotosInJson(broken, store)).toBe(broken);
  });
});
