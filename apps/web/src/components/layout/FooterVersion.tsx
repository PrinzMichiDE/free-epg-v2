import { getServerAppVersionLabel } from "@/lib/app-version-server";

export async function FooterVersion() {
  const label = await getServerAppVersionLabel();

  return (
    <p className="tabular-nums" title="App · EPG pipeline · Git commit">
      {label}
    </p>
  );
}
