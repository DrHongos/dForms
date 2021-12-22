import {
  Text,
  VStack,HStack,
  Button,
  Spinner,
} from '@chakra-ui/react';
import {useHistory} from 'react-router-dom';
import {useSystemsContext} from './../contexts/systems';
import {useWeb3Context} from '../contexts/Web3Context';
import {CheckCircleIcon} from '@chakra-ui/icons';

function Home() {
  const  [,, loading,,peers] = useSystemsContext();
  const { account, providerChainId, loadingWeb3, connectWeb3} = useWeb3Context();
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
          <>
            <HStack>
              <Text fontSize='sm'>Connected IPFS and OrbitDB</Text>
              <CheckCircleIcon style={{color:'green'}}/>
            </HStack>
            {!account?
              <Button onClick={()=>connectWeb3()}>Connect wallet</Button>
              :
              <div>
                {account}
                <Button onClick={()=>console.log('todo!')}>Disconnect</Button>
              </div>
            }
            <Text fontSize='sm'>Users connected {peers?peers.length:0}</Text>
          </>
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
