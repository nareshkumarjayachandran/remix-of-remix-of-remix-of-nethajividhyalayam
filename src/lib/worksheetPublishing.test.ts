import { beforeEach, describe, expect, it, vi } from "vitest";
import JSZip from "jszip";
const mocks = vi.hoisted(() => ({ getUser: vi.fn(), from: vi.fn(), upload: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getUser: mocks.getUser }, from: mocks.from } }));
vi.mock("./kindleLibrary", () => ({ uploadKindleLibraryItem: mocks.upload }));
import { buildWorksheetLibraryFile, publishWorksheetToLibrary, worksheetLibraryStandard, type PublishableWorksheet } from "./worksheetPublishing";
const worksheet: PublishableWorksheet = { title: "Edited <Science> Worksheet", grade: "3rd", subject: "Science", instructions: "Observe carefully", timeLabel: "Time: 2 ½ Hours", sections: [{ heading: "Plants", type: "fill_in_blanks", questions: [{ id: 1, question: "Leaves are ____", answer: "green" }] }] };

describe("worksheet publishing", () => {
  beforeEach(() => vi.clearAllMocks());
  it("maps Class 3 to the library's III grade", () => expect(worksheetLibraryStandard("3rd")).toBe("III"));
  it("does not upload for signed-out visitors", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(publishWorksheetToLibrary(worksheet, "portrait", false)).rejects.toThrow("Sign in");
    expect(mocks.upload).not.toHaveBeenCalled();
  });
  it("does not upload for signed-in non-staff", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "visitor" } }, error: null });
    mocks.from.mockReturnValue({ select: () => ({ eq: () => Promise.resolve({ data: [{ role: "user" }], error: null }) }) });
    await expect(publishWorksheetToLibrary(worksheet, "portrait", false)).rejects.toThrow("Only school staff");
    expect(mocks.upload).not.toHaveBeenCalled();
  });
  it("publishes the edited worksheet with its class for staff with multiple roles", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "staff-id", email: "staff@example.test" } }, error: null });
    mocks.from.mockReturnValue({ select: () => ({ eq: () => Promise.resolve({ data: [{ role: "user" }, { role: "staff" }], error: null }) }) });
    mocks.upload.mockResolvedValue({ id: "published" });
    expect(await publishWorksheetToLibrary(worksheet, "portrait", false)).toEqual({ id: "published" });
    expect(mocks.upload).toHaveBeenCalledWith(expect.objectContaining({ title: worksheet.title, category: "worksheet", standard: "III", userId: "staff-id" }));
  });
  it("includes answers only when selected", async () => {
    const readXml = async (answers: boolean) => {
      const file = await buildWorksheetLibraryFile(worksheet, "portrait", answers);
      const buffer = await new Promise<ArrayBuffer>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result as ArrayBuffer); reader.onerror = reject; reader.readAsArrayBuffer(file); });
      const zip = await JSZip.loadAsync(buffer);
      return zip.file("word/document.xml")?.async("string");
    };
    expect(await readXml(false)).not.toContain("green");
    expect(await readXml(true)).toContain("green");
  });
});