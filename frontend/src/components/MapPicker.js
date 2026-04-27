import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Click handler component
const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position ? <Marker position={position} /> : null;
};

const MapPicker = ({ onLocationSelect, initialPosition }) => {
    const [position, setPosition] = useState(
        initialPosition || null
    );

    const defaultCenter = [19.076, 72.8777]; // Mumbai

    const handleSetPosition = (latlng) => {
        setPosition(latlng);
        if (onLocationSelect) {
            onLocationSelect({
                latitude: latlng.lat,
                longitude: latlng.lng,
            });
        }
    };

    return (
        <div style={{ height: '300px', borderRadius: '12px', overflow: 'hidden' }}>
            <MapContainer
                center={position || defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                    position={position}
                    setPosition={handleSetPosition}
                />
            </MapContainer>
        </div>
    );
};

export default MapPicker;