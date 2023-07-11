import { Flex } from "@chakra-ui/react";
import GoogleMaps from "./components/GoogleMaps";

function App() {
  return (
    <Flex
      className="App"
      position="absolute"
      flexDirection="column"
      alignItems="center"
      h="100vh"
      w="100vw"
    >
      <GoogleMaps />
    </Flex>
  );
}

export default App;
