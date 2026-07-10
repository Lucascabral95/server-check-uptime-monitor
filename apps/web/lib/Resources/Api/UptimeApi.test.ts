import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "@/infraestructure/Api/Axios-config";
import { forceFlushUptime } from "./UptimeApi";

vi.mock("@/infraestructure/Api/Axios-config", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("forceFlushUptime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses POST because flushing mutates server state", async () => {
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: { message: "Buffer flushed successfully" },
    });

    await expect(forceFlushUptime()).resolves.toEqual({
      message: "Buffer flushed successfully",
    });

    expect(axiosInstance.post).toHaveBeenCalledWith("/uptime/flush");
  });
});
