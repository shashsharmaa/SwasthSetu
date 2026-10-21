import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';

const defaultCenter = [19.076, 72.8777];
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitMapToHospitals({ hospitals, center, zoom }) {
  const map = useMap();

  useEffect(() => {
    const coordinates = hospitals
      .filter((hospital) => Number.isFinite(hospital.lat) && Number.isFinite(hospital.lng))
      .map((hospital) => [hospital.lat, hospital.lng]);

    if (coordinates.length === 0) {
      map.setView(center, zoom);
    } else if (coordinates.length === 1) {
      map.setView(coordinates[0], 14);
    } else if (coordinates.length > 1) {
      map.fitBounds(coordinates, { padding: [30, 30] });
    }
  }, [center, hospitals, map, zoom]);

  return null;
}

function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(container);
    map.invalidateSize();

    return () => resizeObserver.disconnect();
  }, [map]);

  return null;
}

export default function HospitalMap({ hospitals, resultType, onSelect, center = defaultCenter, zoom = 10 }) {
  const mappedHospitals = hospitals.filter((hospital) => Number.isFinite(hospital.lat) && Number.isFinite(hospital.lng));

  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ResizeMap />
        <FitMapToHospitals hospitals={mappedHospitals} center={center} zoom={zoom} />
        {mappedHospitals.map((hospital) => (
          <Marker key={hospital.id} position={[hospital.lat, hospital.lng]} icon={markerIcon}>
            <Popup>
              <div className="min-w-[170px]">
                <p className="font-semibold text-gray-900">{hospital.name}</p>
                <p className="mt-1 text-xs text-gray-500">{hospital.address}</p>
                {onSelect ? <button type="button" className="mt-2 text-xs font-semibold text-teal-700 hover:underline" onClick={() => onSelect(hospital)}>View details</button> : <Link className="mt-2 inline-block text-xs font-semibold text-teal-700 hover:underline" to={`/${resultType}/hospital/${hospital.id}`}>View details</Link>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
