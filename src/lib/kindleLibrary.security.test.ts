import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn(), invoke: vi.fn(), storage: vi.fn(), parse: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  rpc: mocks.rpc, from: mocks.from, functions: { invoke: mocks.invoke }, storage: { from: mocks.storage },
} }));
vi.mock("./kindleFileParser", () => ({ MAX_KINDLE_FILE_BYTES: 50 * 1024 * 1024, parseKindleFile: mocks.parse }));
import { fetchKindleLibraryItems, openKindleLibraryItem, type KindleLibraryItem } from "./kindleLibrary";

const item: KindleLibraryItem = {
  id: "e6b8ff3b-9b34-458a-a7b6-3a38bbdfb1c1", title: "School Book", category: "book", standard: "All",
  file_name: "book.txt", file_format: "text", file_size: 50, page_count: 1, word_count: 10, created_at: "2026-11-25",
};
describe("library public access boundaries", () => {
  beforeEach(() => vi.clearAllMocks());
  it("loads the public catalog without querying private staff records", async () => {
    mocks.rpc.mockResolvedValue({ data: [item], error: null });
    expect(await fetchKindleLibraryItems()).toEqual([item]);
    expect(mocks.rpc).toHaveBeenCalledWith("get_public_kindle_catalog");
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("requests a published item by ID, never a caller-controlled storage path", async () => {
    mocks.invoke.mockResolvedValue({ data: null, error: new Error("Not published") });
    await expect(openKindleLibraryItem({ ...item, file_path: "private-draft.txt" })).rejects.toThrow(/no longer published/);
    expect(mocks.invoke).toHaveBeenCalledWith("kindle-library-download", { body: { itemId: item.id } });
    expect(mocks.storage).not.toHaveBeenCalled();
    expect(mocks.parse).not.toHaveBeenCalled();
  });
});