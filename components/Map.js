

// import { useEffect, useRef, useState } from "react";
// import StaticMap from "react-map-gl/mapbox";
// import DeckGL from "@deck.gl/react";
// import { ArcLayer } from "@deck.gl/layers";
// import "mapbox-gl/dist/mapbox-gl.css";

// const MapComponent = ({ story }) => {
//   const mapRef = useRef(null);
//   const [viewState, setViewState] = useState({
//     latitude: 36.7783,
//     longitude: -119.4179,
//     zoom: 12,
//     pitch: 30,
//     bearing: 30,
//   });

//   useEffect(() => {
//     if (mapRef.current && story) {
//       const map = mapRef.current.getMap();
//       map.flyTo({
//         center: [story.location.lng, story.location.lat],
//         zoom: story.zoom,
//         pitch: story.pitch,
//         bearing: story.bearing,
//         speed: 1.5,
//         curve: 2,
//         essential: true,
//       });

//       const onMove = () => {
//         const { lng, lat } = map.getCenter();
//         const zoom = map.getZoom();
//         const pitch = map.getPitch();
//         const bearing = map.getBearing();
//         setViewState({
//           latitude: lat,
//           longitude: lng,
//           zoom,
//           pitch,
//           bearing,
//         });
//       };

//       map.on("move", onMove);

//       return () => {
//         map.off("move", onMove);
//       };
//     }
//   }, [story]);

//   const arcLayer = new ArcLayer({
//     id: "arc-layer",
//     data: story?.arcdata || [],
//     getSourcePosition: (d) => d.source,
//     getTargetPosition: (d) => d.target,
//     getSourceColor: [0, 128, 255],
//     getTargetColor: [255, 0, 128],
//     getWidth: 6,
//     getHeight: 0.6,
//   });

//   return (
//     <>
//       <DeckGL
//         viewState={viewState}
//         controller={true}
//         layers={viewState.zoom > 5 ? [arcLayer] : []}
//         style={{ pointerEvents: "none", zIndex: 1 }}
//       />
//       <StaticMap
//         ref={mapRef}
//         style={{ width: "100vw", height: "100vh", position: "fixed", zIndex: 0 }}
//         mapStyle="mapbox://styles/mapbox/streets-v11"
//         projection="globe"
//         mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
//       />
//     </>
//   );
// };

// export default MapComponent;


import { useEffect, useRef, useState } from "react";
import StaticMap from "react-map-gl/mapbox";
import DeckGL from "@deck.gl/react";
import { ArcLayer, GeoJsonLayer } from "@deck.gl/layers";
import "mapbox-gl/dist/mapbox-gl.css";

const MapComponent = ({ story }) => {
  const mapRef = useRef(null);
  const [viewState, setViewState] = useState({
    latitude: 36.7783,
    longitude: -119.4179,
    zoom: 12,
    pitch: 30,
    bearing: 30,
  });

  const [countryData, setCountryData] = useState(null);

  useEffect(() => {
    if (story) {
      // Fetch country boundaries based on the story's countries
      fetch("../data/countries.geojson")
        .then((response) => response.json())
        .then((data) => {
          // Filter GeoJSON features based on the story's countries
          const filteredFeatures = data.features.filter((feature) =>
            story.countries.includes(feature.properties.ISO_A3)
          );
          setCountryData({
            type: "FeatureCollection",
            features: filteredFeatures,
          });
        });
    }
  }, [story]);

  useEffect(() => {
    if (mapRef.current && story) {
      const map = mapRef.current.getMap();
      map.flyTo({
        center: [story.location.lng, story.location.lat],
        zoom: story.zoom,
        pitch: story.pitch,
        bearing: story.bearing,
        speed: 1.5,
        curve: 2,
        essential: true,
      });

      const onMove = () => {
        const { lng, lat } = map.getCenter();
        const zoom = map.getZoom();
        const pitch = map.getPitch();
        const bearing = map.getBearing();
        setViewState({
          latitude: lat,
          longitude: lng,
          zoom,
          pitch,
          bearing,
        });
      };

      map.on("move", onMove);

      return () => {
        map.off("move", onMove);
      };
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
  });

  const countryLayer = new GeoJsonLayer({
    id: "country-layer",
    data: countryData,
    filled: true,
    stroked: true,
    getFillColor: [0, 128, 255, 100], // Semi-transparent blue
    getLineColor: [0, 0, 255], // Solid blue for borders
    getLineWidth: 2,
    lineWidthMinPixels: 1,
  });

  return (
    <>
      <DeckGL
        viewState={viewState}
        controller={true}
        layers={[
          ...(viewState.zoom > 5 ? [arcLayer] : []),
          ...(countryData ? [countryLayer] : []),
        ]}
        style={{ pointerEvents: "none", zIndex: 1 }}
      />
      <StaticMap
        ref={mapRef}
        style={{ width: "100vw", height: "100vh", position: "fixed", zIndex: 0 }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        projection="globe"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      />
    </>
  );
};

export default MapComponent;