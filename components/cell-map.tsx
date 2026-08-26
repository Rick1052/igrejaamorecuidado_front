"use client";

import dynamic from "next/dynamic";
import type { CellGroup } from "@/lib/types";

const LeafletMap = dynamic(() => import("./leaflet-map").then(module => module.LeafletMap), {
  ssr: false,
  loading: () => <div className="cell-map-loading" role="status">Carregando mapa das células…</div>
});

export function CellMap({ cells }: { cells: CellGroup[] }) {
  return <div className="cell-map-frame" id="mapa-celulas"><LeafletMap cells={cells} /></div>;
}
