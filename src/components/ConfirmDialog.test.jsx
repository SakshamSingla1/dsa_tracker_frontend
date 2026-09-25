import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ConfirmDialog from "./ConfirmDialog.jsx";

describe("ConfirmDialog", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <ConfirmDialog open={false} title="Delete?" onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the title and body when open", () => {
    render(
      <ConfirmDialog open title="Delete this problem?" body="This can't be undone." onConfirm={vi.fn()} onCancel={vi.fn()} />
    );

    expect(screen.getByText("Delete this problem?")).toBeInTheDocument();
    expect(screen.getByText("This can't be undone.")).toBeInTheDocument();
  });

  it("calls onConfirm when the confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog open title="Delete?" confirmLabel="Delete" onConfirm={onConfirm} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when the cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog open title="Delete?" onConfirm={vi.fn()} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("uses the title as the dialog's accessible name", () => {
    render(<ConfirmDialog open title="Delete this problem?" onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole("alertdialog", { name: "Delete this problem?" })).toBeInTheDocument();
  });
});
