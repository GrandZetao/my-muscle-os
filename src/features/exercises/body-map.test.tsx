import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BodyMap } from "@/features/exercises/body-map";

describe("BodyMap", () => {
  it("selects a muscle from the accessible chip list", () => {
    const onSelect = vi.fn();
    render(<BodyMap onSelect={onSelect} />);
    fireEvent.click(screen.getAllByRole("button", { name: "胸" }).at(-1)!);
    expect(onSelect).toHaveBeenCalledWith("胸");
  });
});
