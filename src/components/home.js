import {
  Text,
  VStack,HStack,
  Button,
  Spinner,
} from '@chakra-ui/react';
import {useHistory} from 'react-router-dom';
import {useSystemsContext} from './../contexts/systems';
// import {useWeb3Context} from '../contexts/Web3Context';

function Home() {
  const  [,, loading,,peers] = useSystemsContext();
  // const { account, providerChainId, loadingWeb3, connectWeb3, disconnectWeb3} = useWeb3Context();
  const history = useHistory();
  return (
      <VStack>
        <Text fontSize='xl'>dForms</Text>
        <Text fontSize='md'>Why not to descentralize questionnaires and forms?</Text>
        {loading?
          <HStack>
            <Text fontSize='sm' style={{color:'green'}}>Connecting IPFS and OrbitDB</Text>
            <Spinner style={{color:'green'}}/>
          </HStack>
          :
          <Text fontSize='sm'>Users connected {peers?peers.length:0}</Text>
        }
        <HStack>
          <Button onClick={()=>history.push('create')}>Create</Button>
          <Button onClick={()=>history.push('myforms')}>Manage</Button>
          <Button onClick={()=>history.push('search')}>Search</Button>
        </HStack>
      </VStack>
  );
}

export default Home;
