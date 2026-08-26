"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, Tooltip, ZoomControl } from "react-leaflet";
import type { CellGroup } from "@/lib/types";

function leaderInitials(leaders: string) {
  return leaders
    .split(/\s+e\s+|,/giu)
    .map(person => person.trim().charAt(0))
    .filter(Boolean)
    .join("")
    .toLocaleUpperCase("pt-BR")
    .replace(/[^A-ZÀ-ÖØ-Ý0-9]/g, "")
    .slice(0, 3) || "?";
}

function markerIcon(leaders: string) {
  const initials = leaderInitials(leaders);
  return L.divIcon({ className: "cell-marker-shell", html: `<span>${initials}</span>`, iconSize: [42, 42], iconAnchor: [21, 21], popupAnchor: [0, -24] });
}

function spread(cell: CellGroup, index: number, cells: CellGroup[]): [number, number] {
  const samePoint = cells.filter(item => Math.abs(item.lat - cell.lat) < .00001 && Math.abs(item.lng - cell.lng) < .00001);
  if (samePoint.length < 2) return [cell.lat, cell.lng];
  const position = samePoint.findIndex(item => item.id === cell.id);
  const angle = (position / samePoint.length) * Math.PI * 2;
  const distance = .00022;
  return [cell.lat + Math.sin(angle) * distance, cell.lng + Math.cos(angle) * distance];
}

export function LeafletMap({ cells }: { cells: CellGroup[] }) {
  if (!cells.length) return <div className="cell-map-loading">Nenhuma célula cadastrada no momento.</div>;
  const bounds = L.latLngBounds(cells.map(cell => [cell.lat, cell.lng] as [number, number]));
  return <MapContainer bounds={bounds} boundsOptions={{ padding: [34, 34] }} scrollWheelZoom={false} zoomControl={false} className="cell-map" aria-label="Mapa interativo das células da IAC">
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <ZoomControl position="bottomright" zoomInTitle="Aumentar zoom" zoomOutTitle="Diminuir zoom" />
    {cells.map((cell, index) => <Marker key={cell.id} position={spread(cell, index, cells)} icon={markerIcon(cell.leaders)} title={`${cell.name} — ${cell.leaders}`}>
      <Tooltip direction="top" offset={[0, -22]}>{cell.name}</Tooltip>
      <Popup className="cell-popup"><p className="cell-popup-label">CÉLULA</p><h3>{cell.name}</h3><p><strong>Líderes:</strong> {cell.leaders}</p><p>{cell.address}</p>{cell.phone && <a href={`tel:${cell.phone.replace(/\D/g, "")}`}>{cell.phone}</a>}<a className="cell-route" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cell.address)}`} target="_blank" rel="noreferrer">Como chegar</a></Popup>
    </Marker>)}
  </MapContainer>;
}
