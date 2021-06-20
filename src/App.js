import React from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  Grid,
  theme,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { Route, Switch, Redirect } from 'react-router-dom';
import Home from './components/home';
import CreateForm from './components/create';
import Output from './components/output';
import Stats from './components/stats';
import MyForms from './components/myForms';
import {StateMachineProvider} from "little-state-machine";
function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <ColorModeSwitcher justifySelf="flex-end" />
          <VStack spacing={8}>
          <Switch>
            <Route path='/create'>
              <StateMachineProvider>
                <CreateForm />
              </StateMachineProvider>
            </Route>
            <Route path='/form/:formCID'>
              <Output
              isCreation={false}
              />
            </Route>
            <Route path='/stats/:formCID'>
              <Stats />
            </Route>
            <Route exact path='/myforms'>
            <MyForms />
            </Route>

            <Route exact path='/'>
              <Home />
            </Route>
            <Redirect to="/" />
          </Switch>
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
