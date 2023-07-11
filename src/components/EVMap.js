/*global google*/
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  SkeletonText,
  Text,
} from "@chakra-ui/react";
import { FaLocationArrow, FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import octopusIcon from "../assets/octopusicon.png";

function EVMap() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [chargers, setChargers] = useState([]);
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);

  //G Maps Loader
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  //Marker Distance Calculator
  const handleMarkerClick = (charger) => {
    setSelectedCharger(charger);
    calculateRoute(charger);
  };

  const calculateRoute = (charger) => {
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: currentLocation,
        destination: {
          lat: charger.geometry.location.lat(),
          lng: charger.geometry.location.lng(),
        },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
          const routeDistance = result.routes[0].legs[0].distance.text;
          const routeDuration = result.routes[0].legs[0].duration.text;
          setDistance(routeDistance);
          setDuration(routeDuration);
        }
      }
    );
  };

  //Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, []);

  async function findEVChargers() {
    if (!currentLocation) {
      return;
    }

    setLoading(true);

    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(
      {
        location: currentLocation,
        radius: 10000, // 10km radius
        keyword: "EV Charger",
      },
      (results, status) => {
        setLoading(false);

        if (status === google.maps.places.PlacesServiceStatus.OK) {
          setChargers(results);
          calculateClosestEVChargerDistance(results);
        }
      }
    );
  }

  //Closest EV Charger Calculator
  async function calculateClosestEVChargerDistance() {
    if (chargers.length === 0) {
      setDirectionsResponse(null);
      setDistance("");
      setDuration("");
      return;
    }

    const destinations = chargers.map((charger) => ({
      lat: charger.geometry.location.lat(),
      lng: charger.geometry.location.lng(),
    }));

    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [currentLocation],
        destinations: destinations,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === google.maps.DistanceMatrixStatus.OK) {
          const closestChargerIndex = findClosestChargerIndex(response);
          if (closestChargerIndex >= 0) {
            setDirectionsResponse(response);
            setDistance(
              response.rows[0].elements[closestChargerIndex].distance.text
            );
            setDuration(
              response.rows[0].elements[closestChargerIndex].duration.text
            );
            showPathToClosestCharger(closestChargerIndex);
          }
        } else {
          setDirectionsResponse(null);
          setDistance("");
          setDuration("");
        }
      }
    );
  }

  function findClosestChargerIndex(response) {
    let closestChargerIndex = -1;
    let minDistance = Number.MAX_VALUE;

    for (let i = 0; i < response.rows[0].elements.length; i++) {
      const element = response.rows[0].elements[i];
      if (element.status === google.maps.DistanceMatrixStatus.OK) {
        const distance = element.distance.value;
        if (distance < minDistance) {
          minDistance = distance;
          closestChargerIndex = i;
        }
      }
    }

    return closestChargerIndex;
  }

  //Path to closest charger
  function showPathToClosestCharger(closestChargerIndex) {
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: currentLocation,
        destination: {
          lat: chargers[closestChargerIndex].geometry.location.lat(),
          lng: chargers[closestChargerIndex].geometry.location.lng(),
        },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
        }
      }
    );
  }

  //Clear Function
  function clearChargers() {
    setSelectedCharger(null);
    setChargers([]);
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");
  }

  //Loaded check
  if (!isLoaded) {
    return <SkeletonText />;
  }


  return (
    <Flex
      position="relative"
      flexDirection="column"
      alignItems="center"
      h="100vh"
      w="100vw"
    >
      <Box position="absolute" left={0} top={0} h="100%" w="100%">
        {/* Google Map Box */}
        {currentLocation && (
          <GoogleMap
            center={currentLocation}
            zoom={15}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            options={{
              zoomControl: false,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              mapId: process.env.REACT_APP_MAP_ID,
            }}
            onLoad={(map) => setMap(map)}
          >
            {currentLocation && (
              <Marker
                position={currentLocation}
                icon={{ fillColor: "green" }}
              />
            )}
            {chargers.map((charger) => (
              <Marker
                key={charger.place_id}
                position={{
                  lat: charger.geometry.location.lat(),
                  lng: charger.geometry.location.lng(),
                }}
                icon={{
                  url: octopusIcon,
                  scaledSize: new window.google.maps.Size(32, 32),
                }}
                onClick={() => handleMarkerClick(charger)}
              />
            ))}
            {directionsResponse && (
              <DirectionsRenderer directions={directionsResponse} />
            )}
          </GoogleMap>
        )}
      </Box>
      <Box
        p={4}
        borderRadius="lg"
        m={4}
        bgColor="brand.200"
        shadow="base"
        minW="container.md"
        zIndex="1"
      >
        <HStack spacing={4} justifyContent="center">
          <Button
            bg="brand.100"
            color="brand.200"
            _hover={{
              background: "brand.101",
            }}
            onClick={findEVChargers}
            disabled={!currentLocation || loading}
          >
            {loading ? "Loading..." : "Find EV Chargers"}
          </Button>
          <Button
            bg="brand.100"
            color="brand.200"
            _hover={{
              background: "brand.101",
            }}
            onClick={calculateClosestEVChargerDistance}
            disabled={!currentLocation || chargers.length === 0 || loading}
          >
            Closest EV Charger
          </Button>
          <IconButton
            aria-label="center back"
            icon={<FaTimes />}
            onClick={clearChargers}
            disabled={loading}
          />
        </HStack>
        <HStack spacing={4} mt={4} justifyContent="center">
          <Text color="brand.100">
            {chargers.length > 0
              ? `Found ${chargers.length} EV Chargers`
              : "No EV Chargers found"}
          </Text>
          {currentLocation && (
            <IconButton
              aria-label="center back"
              icon={<FaLocationArrow />}
              isRound
              onClick={() => {
                map.panTo(currentLocation);
                map.setZoom(15);
              }}
            />
          )}
        </HStack>
        <HStack spacing={4} mt={4} justifyContent="center">
          <Text color="brand.100">Distance: {distance}</Text>
          <Text color="brand.100">Duration: {duration}</Text>
        </HStack>
      </Box>
    </Flex>
  );
}

export default EVMap;
