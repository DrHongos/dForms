import {
  Text,
  VStack,HStack,
  Button,
} from '@chakra-ui/react';
import {useHistory} from 'react-router-dom';

function Home() {
  const history = useHistory();
  return (
      <VStack>
        <Text fontSize='xl'>dForms</Text>
        <Text fontSize='md'>Why not to descentralize questionnaires and forms?</Text>
        <Text fontSize='sm'>Remember this is unencrypted and public!</Text>
        <HStack>
          <Button onClick={()=>history.push('create')}>Create & Manage</Button>
          <Button onClick={()=>history.push('myforms')}>Search forms and stats</Button>{/*console.log('search by category, tags, location, creator, and/or ID')*/}
        </HStack>
        <Text fontSize='sm'>Forms are key:value databases, with controlled answers</Text>
        <Text fontSize='sm'>Responses are eventlogs with the data (and the signature) on a DB</Text>
        <Text fontSize='sm'>Counters could be used to track information</Text>
        <Text fontSize='sm'>Could be a user database, to track their studies and ranking</Text>

      </VStack>
  );
}

export default Home;
