import {
  Text,
  VStack,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,

} from '@chakra-ui/react';
import {DeleteIcon, EditIcon, InfoIcon, CopyIcon } from '@chakra-ui/icons';
import {useHistory} from 'react-router-dom';
import {useSystemsContext} from './../contexts/systems';
import copyClipBoard from "../logic/copyClipBoard"
import GoBack from './common/goBack';


function MyForms() {
  const history = useHistory();
  const  [, , , myForms, entries] = useSystemsContext();

  const removeDatabase = async (hash) => {
    console.log(hash.hash)
    return myForms.remove(hash.hash)
    // react to the entries change.. (refresh?)
  }




  return (
    <VStack>
      <GoBack
        path='/'
      />

    {entries && entries.length > 0?
      <Table>
        <TableCaption placement='top'>My forms supported! (import one!)</TableCaption>
        <Thead>
          <Tr key='title'>
            <Th>Name</Th>
            <Th>Address</Th>
            <Th>Functions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {entries.map(x=>{return(
            <Tr key={x.hash}>
              <Td >{x.payload.value.name}</Td>
              <Td >{x.payload.value.formDataCid.slice(0,5)}..</Td>
              <Td >
                <IconButton
                  onClick={()=>copyClipBoard('localhost:3000/#/form/'+x.payload.value.formDataCid)}
                  aria-label="Copy"
                  icon={<CopyIcon />} />
                <IconButton
                  onClick={()=>{history.push('form/'+x.payload.value.formDataCid)}}
                  aria-label="Edit"
                  icon={<EditIcon />} />
                <IconButton
                  onClick={()=>{history.push('stats/'+x.payload.value.formDataCid)}}
                  aria-label="Stats"
                  icon={<InfoIcon />} />
                <IconButton
                  onClick={()=>removeDatabase(x)}
                  aria-label="Delete"
                  icon={<DeleteIcon />} />

              </Td>
            </Tr>
          )})}
        </Tbody>

        </Table>
      :
      <Text >You have no forms!</Text>
    }
    </VStack>
  );
}

export default MyForms;
