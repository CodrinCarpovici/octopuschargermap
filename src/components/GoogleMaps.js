import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  IconButton,
  Input,
  SkeletonText,
  Text,
  Flex
} from "@chakra-ui/react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { FaLocationArrow, FaTimes } from "react-icons/fa";
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
    <Flex
      className="App"
      position="absolute"
      flexDirection="column"
      alignItems="center"
      h="100vh"
      w="100vw"
    >
      <Box position="absolute" left={0} top={0} h="100%" w="100%">
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          <Marker position={center} />
        </GoogleMap>
      </Box>
      <Box
        p={4}
        borderRadius="lg"
        m={4}
        bgColor="white"
        shadow="base"
        minW="container.md"
        zIndex="modal"
      >
        <HStack spacing={2} justifyContent="space-between">
          <Box flexGrow={1}>
            <Input type="text" placeholder="Origin" />
          </Box>
          <Box flexGrow={1}>
            <Input type="text" placeholder="Destination" />
          </Box>

          <ButtonGroup>
            <Button colorScheme="pink" type="submit">
              Calculate Route
            </Button>
            <IconButton aria-label="center back" icon={<FaTimes />} />
          </ButtonGroup>
        </HStack>
        <HStack spacing={4} mt={4} justifyContent="space-between">
          <Text>Distance: </Text>
          <Text>Duration: </Text>
          <IconButton
            aria-label="center back"
            icon={<FaLocationArrow />}
            isRound
          />
        </HStack>
      </Box>
    </Flex>
  );
};

export default GoogleMaps;
