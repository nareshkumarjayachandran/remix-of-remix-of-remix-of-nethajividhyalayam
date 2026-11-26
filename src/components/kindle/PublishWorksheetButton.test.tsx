import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  checkStaffPublishingAccess: vi.fn(),
  publishWorksheetToLibrary: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { signInWithPassword: mocks.signInWithPassword } },
}));
vi.mock("@/lib/worksheetPublishing", () => ({
  checkStaffPublishingAccess: mocks.checkStaffPublishingAccess,
  publishWorksheetToLibrary: mocks.publishWorksheetToLibrary,
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));

import PublishWorksheetButton from "./PublishWorksheetButton";

const sampleWorksheet = {
  title: "Class 3 Science Quiz",
  grade: "3rd",
  subject: "Science",
  instructions: "Answer all questions.",
  sections: [{ heading: "Plants", type: "fill_in_blanks", questions: [{ id: 1, question: "Leaves are ____", answer: "green" }] }],
};

describe("PublishWorksheetButton", () => {
  beforeEach(() => vi.clearAllMocks());

  it("asks for Kindle Library Admin sign in when signed out, then publishes after staff sign in", async () => {
    mocks.checkStaffPublishingAccess
      .mockResolvedValueOnce({ status: "unauthenticated" })
      .mockResolvedValueOnce({ status: "authorized", userId: "staff-1", email: "staff@nethajividhyalayam.org" });
    mocks.signInWithPassword.mockResolvedValue({ error: null });
    mocks.publishWorksheetToLibrary.mockResolvedValue({ id: "item-42" });

    render(
      <MemoryRouter>
        <PublishWorksheetButton worksheet={sampleWorksheet} layout="portrait" includeAnswers={false} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /publish to kindle library/i }));

    expect(await screen.findByText("Kindle Library Admin Sign In")).toBeInTheDocument();
    expect(mocks.publishWorksheetToLibrary).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Staff Email"), { target: { value: "staff@nethajividhyalayam.org" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in & publish/i }));

    await waitFor(() => expect(mocks.publishWorksheetToLibrary).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole("link", { name: /view published worksheet/i })).toHaveAttribute("href", "/kindle-reader?item=item-42");
  });

  it("publishes directly when already signed in as staff", async () => {
    mocks.checkStaffPublishingAccess.mockResolvedValue({ status: "authorized", userId: "staff-1", email: "staff@nethajividhyalayam.org" });
    mocks.publishWorksheetToLibrary.mockResolvedValue({ id: "item-99" });

    render(
      <MemoryRouter>
        <PublishWorksheetButton worksheet={sampleWorksheet} layout="portrait" includeAnswers={false} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /publish to kindle library/i }));

    await waitFor(() => expect(mocks.publishWorksheetToLibrary).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("Kindle Library Admin Sign In")).not.toBeInTheDocument();
  });
});