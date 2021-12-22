import React from 'react'
import {  Button, Wrap,WrapItem, Spacer, HStack, Text } from "@chakra-ui/react"
import {useHistory} from 'react-router-dom';
import Systems from './systems';
// import ConnectedPeers from './commons/connectedPeers';
import {useSystemsContext} from '../contexts/systems';

function Header () {
  const  [ipfsNode, , , ,] = useSystemsContext();
  // const [] // selected route?
  const history = useHistory();
  function handleVis(){
    history.push('/');
  }


  return (
    <HStack w='100%'>
      <Systems />
      <Text color='red' fontSize='sm'>Remember this is now unencrypted and public!</Text>
      <Spacer />
      <Wrap>
        <WrapItem>
        <Button variant="outline" colorScheme="white" onClick={handleVis}>Home</Button>
        </WrapItem>
      </Wrap>
    </HStack>
  )
}

export default Header
