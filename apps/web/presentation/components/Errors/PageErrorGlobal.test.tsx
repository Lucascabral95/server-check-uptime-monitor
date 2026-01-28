import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import PageErrorGlobal from "./PageErrorGlobal";
import { useAuth } from "@/lib/hooks";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/hooks", () => ({
  useAuth: vi.fn(),
}));

describe("PageErrorGlobal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 404 error content", () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: false });

    render(<PageErrorGlobal />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByText("Página no encontrada")
    ).toBeInTheDocument();
    expect(
      screen.getByText("La página que buscas no existe o ha sido movida.")
    ).toBeInTheDocument();
  });

  it("renders link to home", () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: false });

    render(<PageErrorGlobal />);

    const homeLink = screen.getByRole("link", { name: /ir al inicio/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("calls history.back when clicking 'Volver atrás'", () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: false });

    const backSpy = vi.spyOn(window.history, "back").mockImplementation(() => {});

    render(<PageErrorGlobal />);

    fireEvent.click(
      screen.getByRole("button", { name: /volver atrás/i })
    );

    expect(backSpy).toHaveBeenCalledTimes(1);
  });

  it("shows auth links when user is NOT authenticated", () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: false });

    render(<PageErrorGlobal />);

    expect(screen.getByText("Iniciar sesión")).toBeInTheDocument();
    expect(screen.getByText("Registrarse")).toBeInTheDocument();
  });

  it("does NOT show auth links when user IS authenticated", () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: true });

    render(<PageErrorGlobal />);

    expect(
      screen.queryByText("Iniciar sesión")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Registrarse")
    ).not.toBeInTheDocument();
  });
});
