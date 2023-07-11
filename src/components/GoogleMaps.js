import { Box, SkeletonText } from "@chakra-ui/react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import React from "react";

const center = { lat: 51.510357, lng: -0.116773 };

const GoogleMaps = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  if (!isLoaded) {
    return <SkeletonText />;
  }
  return (
    <Box position="absolute" left={0} top={0} h="100%" w="100%">
      <GoogleMap
        center={center}
        zoom={15}
        mapContainerStyle={{ width: "100%", height: "100%" }}
      ></GoogleMap>
    </Box>
  );
};

export default GoogleMaps;
