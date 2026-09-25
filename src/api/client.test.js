import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, fetchSheets, loginUser, setToken, updateProblem } from "./client.js";

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: async () => body,
  };
}

describe("api client request() wrapper (exercised via the exported endpoint functions)", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("attaches a bearer token from localStorage when one is set", async () => {
    setToken("my-jwt");
    global.fetch.mockResolvedValueOnce(jsonResponse([]));

    await fetchSheets();

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer my-jwt");
  });

  it("does not attach an Authorization header when there is no token", async () => {
    global.fetch.mockResolvedValueOnce(jsonResponse([]));

    await fetchSheets();

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it("returns parsed JSON on success", async () => {
    global.fetch.mockResolvedValueOnce(jsonResponse([{ slug: "a2z" }]));

    const result = await fetchSheets();

    expect(result).toEqual([{ slug: "a2z" }]);
  });

  it("dispatches auth:unauthorized on a 401 for a normal (non-login/register) endpoint", async () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    global.fetch.mockResolvedValueOnce(jsonResponse({ message: "expired" }, { ok: false, status: 401 }));

    await expect(fetchSheets()).rejects.toThrow(ApiError);

    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: "auth:unauthorized" }));
  });

  it("does NOT dispatch auth:unauthorized on a 401 from the login endpoint itself (wrong password, not an expired session)", async () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    global.fetch.mockResolvedValueOnce(jsonResponse({ message: "Incorrect email or password." }, { ok: false, status: 401 }));

    await expect(loginUser("a@b.com", "wrong")).rejects.toThrow(ApiError);

    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: "auth:unauthorized" }));
  });

  it("extracts the server's error message from a JSON error body", async () => {
    global.fetch.mockResolvedValueOnce(jsonResponse({ message: "Display name can't be blank." }, { ok: false, status: 400 }));

    await expect(updateProblem(1, { notes: "x" })).rejects.toThrow("Display name can't be blank.");
  });

  it("falls back to a generic message when the error body has no message field", async () => {
    global.fetch.mockResolvedValueOnce(jsonResponse({}, { ok: false, status: 500 }));

    await expect(fetchSheets()).rejects.toThrow(/GET \/sheets failed \(500\)/);
  });

  it("falls back to a generic message when the error response body isn't valid JSON", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("not json");
      },
    });

    await expect(fetchSheets()).rejects.toThrow(/failed \(500\)/);
  });

  it("returns null for a 204 No Content response instead of trying to parse a body", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, status: 204, json: async () => { throw new Error("should not be called"); } });

    const result = await fetchSheets();

    expect(result).toBeNull();
  });

  it("carries the HTTP status onto the thrown ApiError", async () => {
    global.fetch.mockResolvedValueOnce(jsonResponse({ message: "nope" }, { ok: false, status: 403 }));

    try {
      await fetchSheets();
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(403);
    }
  });
});
