"use client";
import { useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

const pin = L.divIcon({
  className: "",
  html: '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#501018;transform:rotate(-45deg);border:2px solid #B0A69A;box-shadow:0 0 14px rgba(80,16,24,.9)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 22]
});

function NoFlag() {
  const map = useMap();
  map.attributionControl.setPrefix(false);
  return null;
}

function Picker({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng) });
  return null;
}

export default function LeafletMap({ mechanics = [], picker = false, height = 420, center = [14.2, 76.4], zoom }) {
  const [picked, setPicked] = useState(null);
  return (
    <div>
      <MapContainer attributionControl={true} center={center} zoom={zoom ?? (picker ? 7 : 6.5)} zoomSnap={0.1} scrollWheelZoom={false} style={{ height }}>
        <NoFlag />
        <TileLayer attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors" url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}" maxZoom={16} />
        {mechanics
          .filter((m) => m.lat && m.lng)
          .map((m) => (
            <Marker key={m.id} position={[m.lat, m.lng]} icon={pin}>
              <Popup>
                <b>{m.shop_name}</b>
                <br />
                {m.address || m.city}
                {m.google_rating ? <><br />Google rating: {m.google_rating} ★</> : null}
              </Popup>
            </Marker>
          ))}
        {picker && (
          <>
            <Picker onPick={setPicked} />
            {picked && <Marker position={picked} icon={pin} />}
          </>
        )}
      </MapContainer>
      {picker && (
        <>
          <input type="hidden" name="lat" value={picked?.lat ?? ""} />
          <input type="hidden" name="lng" value={picked?.lng ?? ""} />
          <p className="mt-2 text-xs text-gunmetal">{picked ? `Pinned at ${picked.lat.toFixed(4)}, ${picked.lng.toFixed(4)}` : "Click on the map to pin your garage (optional)."}</p>
        </>
      )}
    </div>
  );
}
