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
function MyForms() {
  const history = useHistory();
  const  [, , , myForms, entries] = useSystemsContext();

  const removeDatabase = async (hash) => {
    if(window.confirm("Do you really want to unsupport this form?")){
      console.log('deleted!')
      return myForms.remove(hash.hash)
    }else{
      console.log('Rejected by the user')
    }
    // react to the entries change.. (refresh?)
  }


  return (
    <VStack>
      {entries && entries.length > 0?
        <Table>
          <TableCaption placement='top'>My forms supported!</TableCaption>
          <Thead>
            <Tr key='title'>
              <Th>Name</Th>
{/*              <Th>Address</Th>*/}
              <Th>Functions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {entries.map(x=>{return(
              <Tr key={x.hash}>
                <Td >{x.payload.value.name}</Td>
{/*                <Td >{x.payload.value.formDataCid.slice(0,5)}..</Td>*/}
                <Td >
                  <IconButton
                    onClick={()=>copyClipBoard('https://still-hall-4364.on.fleek.co/#/form/'+x.payload.value.dbAddress)}                    aria-label="Copy"
                    icon={<CopyIcon />} />
                  <IconButton
                    onClick={()=>{history.push('form/'+x.payload.value.dbAddress)}}
                    aria-label="Edit"
                    icon={<EditIcon />} />
                  <IconButton
                    onClick={()=>{history.push('stats/'+x.payload.value.dbAddress)}}
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
