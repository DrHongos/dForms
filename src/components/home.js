import {
  Text,
  VStack,HStack,
  Button,
  Spinner,
} from '@chakra-ui/react';
import {useHistory} from 'react-router-dom';
import {useSystemsContext} from './../contexts/systems';
import {CheckCircleIcon} from '@chakra-ui/icons';
function Home() {

  const  [,, loading,] = useSystemsContext();
  const history = useHistory();
  return (
      <VStack>
        <Text fontSize='xl'>dForms</Text>
        <Text fontSize='md'>Why not to descentralize questionnaires and forms?</Text>
        <Text fontSize='sm' style={{color:'red'}}>Remember this is unencrypted and public!</Text>
        {loading?
          <HStack>
            <Text fontSize='sm' style={{color:'green'}}>Connecting IPFS and OrbitDB</Text>
            <Spinner style={{color:'green'}}/>
          </HStack>
          :
          <HStack>
            <Text fontSize='sm'>Connected IPFS and OrbitDB</Text>
            <CheckCircleIcon style={{color:'green'}}/>
          </HStack>
        }
        <HStack>
          <Button onClick={()=>history.push('create')}>Create</Button>
          <Button onClick={()=>history.push('myforms')}>Manage</Button>
          <Button isDisabled onClick={()=>console.log('search by category, tags, location, creator, and/or ID')}>Search</Button>
        </HStack>
      </VStack>
  );
}

export default Home;
