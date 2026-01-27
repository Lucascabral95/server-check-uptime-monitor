import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import CardUptime from "./CardUptime";
import { Status } from "@/infraestructure/interfaces";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  redirect: vi.fn(),
}));

vi.mock("@/presentation/hooks/useUpdateMonitor.hook", () => ({
  default: () => ({
    submitDelete: vi.fn(),
  }),
}));

vi.mock("@/presentation/hooks", () => ({
  useUptimeCheck: () => ({
    timeUntilNextCheck: 60000,
  }),
}));

vi.mock("@/presentation/utils", () => ({
  formatDate: () => "2024-01-15",
  formatLastCheck: () => "Hace 1 minuto",
  formatTimeRemaining: () => "1m",
  getStatusColor: () => "green",
}));

const mockSetToast = vi.fn();

const mockUptime = {
  id: "1",
  userId: "user1",
  name: "Test Monitor",
  url: "https://example.com",
  frequency: 60,
  isActive: true,
  nextCheck: new Date(),
  lastCheck: new Date(),
  status: Status.UP,
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
};

describe("CardUptime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders monitor data correctly", () => {
    render(<CardUptime uptimes={mockUptime} setToast={mockSetToast} />);

    expect(screen.getByText("Test Monitor")).toBeInTheDocument();
    expect(screen.getByText("HTTP")).toBeInTheDocument();
    expect(screen.getByText("60s")).toBeInTheDocument();
  });

  it("formats date correctly", () => {
    render(<CardUptime uptimes={mockUptime} setToast={mockSetToast} />);

    expect(screen.getByText("2024-01-15")).toBeInTheDocument();
  });

  it("toggles menu when more button is clicked", () => {
    const { container } = render(
      <CardUptime uptimes={mockUptime} setToast={mockSetToast} />
    );

    const button = container.querySelector(".more-button") as HTMLElement;

    fireEvent.click(button);

    expect(screen.getByText("Editar monitor")).toBeInTheDocument();
    expect(screen.getByText("Eliminar monitor")).toBeInTheDocument();
  });

  it("closes menu when clicking outside", async () => {
    const { container } = render(
      <CardUptime uptimes={mockUptime} setToast={mockSetToast} />
    );

    const button = container.querySelector(".more-button") as HTMLElement;

    fireEvent.click(button);
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(
        screen.queryByText("Editar monitor")
      ).not.toBeInTheDocument();
    });
  });

  it("renders frequency correctly", () => {
    render(
      <CardUptime
        uptimes={{ ...mockUptime, frequency: 30 }}
        setToast={mockSetToast}
      />
    );

    expect(screen.getByText("30s")).toBeInTheDocument();
  });

  it("renders safely with null lastCheck", () => {
    render(
      <CardUptime
        uptimes={{ ...mockUptime, lastCheck: new Date() }}
        setToast={mockSetToast}
      />
    );

    expect(screen.getByText("Test Monitor")).toBeInTheDocument();
  });

  it("handles rapid menu toggle clicks", () => {
    const { container } = render(
      <CardUptime uptimes={mockUptime} setToast={mockSetToast} />
    );

    const button = container.querySelector(".more-button") as HTMLElement;

    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(screen.getByText("Editar monitor")).toBeInTheDocument();
  });
});
