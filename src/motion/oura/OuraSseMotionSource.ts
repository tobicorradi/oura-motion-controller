export type OuraAcmSample = { x: number; y: number; z: number };
export const parseOuraAcmSample = (data: string): OuraAcmSample | null => {
  try {
    const value: unknown = JSON.parse(data);
    if (!value || typeof value !== "object") return null;
    const { x, y, z } = value as Record<string, unknown>;
    return [x, y, z].every(
      (item) => typeof item === "number" && Number.isFinite(item),
    )
      ? { x: x as number, y: y as number, z: z as number }
      : null;
  } catch {
    return null;
  }
};
export type OuraSourceCallbacks = {
  onSample: (sample: OuraAcmSample) => void;
  onState: (state: "connected" | "reconnecting" | "error") => void;
};
export class OuraSseMotionSource {
  private eventSource: EventSource | null = null;
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private stopped = false;
  constructor(private readonly callbacks: OuraSourceCallbacks) {}
  async checkBridge(timeout = 1800) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch("/oura/", {
        signal: controller.signal,
        cache: "no-store",
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  }
  async connect() {
    this.stopped = false;
    if (!(await this.checkBridge()))
      throw new Error("The local open_oura bridge is not running.");
    this.openStream();
    const response = await fetch("/oura/start", {
      headers: { "x-oura-viz": "1" },
    });
    if (!response.ok)
      throw new Error("The local bridge could not start the ring stream.");
  }
  private openStream() {
    if (this.eventSource) return;
    this.eventSource = new EventSource("/oura/stream");
    this.eventSource.onopen = () => {
      this.reconnectAttempts = 0;
      this.callbacks.onState("connected");
    };
    this.eventSource.onmessage = (event) => {
      const sample = parseOuraAcmSample(event.data);
      if (sample) this.callbacks.onSample(sample);
    };
    this.eventSource.onerror = () => {
      this.closeEventSource();
      if (this.stopped) return;
      this.callbacks.onState("reconnecting");
      if (this.reconnectAttempts++ >= 4) {
        this.callbacks.onState("error");
        return;
      }
      const delay = Math.min(8000, 500 * 2 ** this.reconnectAttempts);
      this.reconnectTimer = window.setTimeout(() => this.openStream(), delay);
    };
  }
  async disconnect() {
    this.stopped = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.closeEventSource();
    try {
      await fetch("/oura/stop", {
        headers: { "x-oura-viz": "1" },
        keepalive: true,
      });
    } catch {
      /* upstream disconnect safety still applies */
    }
  }
  dispose() {
    void this.disconnect();
  }
  private closeEventSource() {
    this.eventSource?.close();
    this.eventSource = null;
  }
}
