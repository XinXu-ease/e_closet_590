const FIGMA_PROTOTYPE_URL =
  "https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2F7UmauOUmGRW7XMDdAkCosY%2F590%3Fnode-id%3D24-69%26starting-point-node-id%3D24%253A69%26scaling%3Dscale-down";

export function FigmaLive() {
  return (
    <main className="figma-live-shell">
      <iframe
        className="figma-live-frame"
        title="E-Closet Auto Layout review prototype"
        src={FIGMA_PROTOTYPE_URL}
        allowFullScreen
      />
      <a className="figma-live-fallback" href="/native">
        Open React fallback
      </a>
    </main>
  );
}
