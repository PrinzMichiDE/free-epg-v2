export default function XmltvDocsPage() {
  return (
    <article>
      <h1>XMLTV Format</h1>
      <p>
        XMLTV ist der de-facto Standard für elektronische Programmführer. FreeEPG
        liefert XMLTV 0.1 kompatible Dateien.
      </p>
      <pre className="font-mono text-sm bg-[var(--card)] p-4 rounded-lg overflow-x-auto">{`<?xml version="1.0" encoding="UTF-8"?>
<tv generator-info-name="FreeEPG">
  <channel id="ARD.de">
    <display-name>Das Erste</display-name>
  </channel>
  <programme start="20260412120000 +0000" stop="20260412130000 +0000" channel="ARD.de">
    <title>Tagesschau</title>
  </programme>
</tv>`}</pre>
    </article>
  );
}
