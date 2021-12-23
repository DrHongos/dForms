import React from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  Grid,
  theme,
} from '@chakra-ui/react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Header from './components/header';
import Home from './components/home';
import CreateForm from './components/create';
import Output from './components/output';
import Stats from './components/stats';
import MyForms from './components/myForms';
import FormImport from './components/formImport';
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Header />
        <Grid minH="100vh" p={3}>
          <Toaster />
          <VStack spacing={8}>
          <Switch>
            <Route path='/create'>
                <CreateForm />
            </Route>
            <Route path='/form/:formCID'>
              <Output
              isCreation={false}
              />
            </Route>
            <Route path='/search'>
              <FormImport />
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
