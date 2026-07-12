export default function ApiDocsPage() {
  return (
    <article>
      <h1>API Referenz</h1>
      <h2>XML Endpunkte</h2>
      <table className="w-full text-sm">
        <thead>
          <tr><th className="text-left p-2">Endpoint</th><th className="text-left p-2">Beschreibung</th></tr>
        </thead>
        <tbody>
          <tr><td className="p-2 font-mono">GET /api/epg/{"{country}"}.xml</td><td className="p-2">Land-EPG</td></tr>
          <tr><td className="p-2 font-mono">GET /api/epg/{"{country}"}.xml.gz</td><td className="p-2">gzip</td></tr>
          <tr><td className="p-2 font-mono">GET /api/epg/list/{"{id}"}.xml</td><td className="p-2">Custom List EPG</td></tr>
          <tr><td className="p-2 font-mono">GET /api/epg/m3u/{"{id}"}.xml</td><td className="p-2">M3U EPG</td></tr>
        </tbody>
      </table>
      <h2>JSON Endpunkte</h2>
      <table className="w-full text-sm">
        <tbody>
          <tr><td className="p-2 font-mono">GET /api/countries</td><td className="p-2">Länder + Stats</td></tr>
          <tr><td className="p-2 font-mono">GET /api/channels?q=ARD</td><td className="p-2">Sender-Suche</td></tr>
          <tr><td className="p-2 font-mono">POST /api/m3u/upload</td><td className="p-2">M3U Upload</td></tr>
          <tr><td className="p-2 font-mono">GET /api/health</td><td className="p-2">Health Check</td></tr>
        </tbody>
      </table>
    </article>
  );
}
