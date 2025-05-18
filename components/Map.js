import { useEffect, useRef, useState } from "react";
import { Map as MapGL, Source, Layer } from "react-map-gl/mapbox";
import DeckGL from "@deck.gl/react";
import { ArcLayer } from "@deck.gl/layers";
import { FlyToInterpolator } from '@deck.gl/core';
import { easeCubic } from 'd3-ease';
import "mapbox-gl/dist/mapbox-gl.css";


const INITIAL_VIEW_STATE = {
  latitude: 36.7783,
  longitude: -119.4179,
  zoom: 12,
  pitch: 30,
  bearing: 30,
};

const MapComponent = ({ story }) => {
  const mapRef = useRef(null);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [countryData, setCountryData] = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  // Update viewState when story changes
  useEffect(() => {
    if (story?.location) {
      setTransitioning(true);
      setViewState({
        longitude: story.location.lng,
        latitude: story.location.lat,
        zoom: story.zoom || viewState.zoom,
        pitch: story.pitch || viewState.pitch,
        bearing: story.bearing || viewState.bearing,
        transitionDuration: 2000,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: easeCubic,
        onTransitionEnd: () => setTransitioning(false)
      });
    }
  }, [story]);

  // Handle map movement
  const onViewStateChange = ({ viewState: newViewState }) => {
    setViewState(newViewState);
  };

  useEffect(() => {
    if (story) {
      // Fetch country boundaries based on the story's countries
      fetch("/data/countries8.geojson")
        .then((response) => response.json())
        .then((data) => {
          // Filter GeoJSON features based on the story's countries
          const filteredFeatures = data.features.filter((feature) =>
            story.countries.includes(feature.properties.adm0_a3)
          );
          setCountryData({
            type: "FeatureCollection",
            features: filteredFeatures,
          });
        });
    }
  }, [story]);

  const arcLayer = new ArcLayer({
    id: "arc-layer",
    data: story?.arcdata || [],
    getSourcePosition: (d) => d.source,
    getTargetPosition: (d) => d.target,
    getSourceColor: [0, 128, 255],
    getTargetColor: [255, 0, 128],
    getWidth: 6,
    getHeight: 0.6,
    fadeEnabled: true,
    fadeAmount: transitioning ? 0.5 : 1
  });

  const countryFillLayer = {
    id: 'country-fills',
    type: 'fill',
    paint: {
      'fill-color': 'rgba(0, 128, 255, 0.4)',
      'fill-opacity': 0.4
    }
  };

  const countryLineLayer = {
    id: 'country-borders',
    type: 'line',
    paint: {
      'line-color': 'rgba(0, 0, 255, 0.8)',
      'line-width': 2
    }
  };
  return (
    <>
      <DeckGL
        viewState={viewState}
        onViewStateChange={onViewStateChange}
        controller={true}
        layers={[
          ...(viewState.zoom > 5 ? [arcLayer] : [])
        ]}
        style={{ pointerEvents: "none", zIndex: 1 }}
      >
        <MapGL
          ref={mapRef}
          reuseMaps
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          {...viewState}
          style={{
            width: "100vw",
            height: "100vh",
            position: "fixed",
            zIndex: 0,
          }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          projection="globe"
          terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
        >
          {countryData && (
            <Source type="geojson" data={countryData}>
              <Layer {...countryFillLayer} />
              <Layer {...countryLineLayer} />
            </Source>
          )}
        </MapGL>
      </DeckGL>
    </>
  );
};

export default MapComponent;