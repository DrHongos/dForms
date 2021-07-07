import {
  VStack,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  HStack,
  Button,
} from '@chakra-ui/react';
import {InfoIcon, EditIcon } from '@chakra-ui/icons';
import {useHistory} from 'react-router-dom';
import {useSystemsContext} from './../contexts/systems';
import {useState} from 'react';

function FormImport() {
  const history = useHistory();
  const  [ipfsNode, , , ,] = useSystemsContext();
  const [searchAddress, setSearchAddress] = useState();
  const [formFound, setFormFound] = useState();

  async function searchForm(){
    console.log('searching for ',searchAddress)
    try{
      for await (const result of ipfsNode.cat(searchAddress)) {
        if(result.name && result.description && result.responses){
          console.log(result)
          setFormFound(result)
          return result
        }else{
          return 'error'
        }
      }
    }catch{
      setFormFound()
    }

  }

  return (
    <VStack>
      <FormControl id="importDB" isRequired>
        <HStack>
          <FormLabel>Address</FormLabel>
          <Input type="string" onChange={e=>setSearchAddress(e.target.value)} placeholder='bafyr..'/>
          <Button onClick={()=>searchForm()}>Find</Button>
        </HStack>
        <FormHelperText>Search for forms to answer & support!</FormHelperText>
      </FormControl>
      {formFound?
        <Table>
          <TableCaption placement='top'>Form found!</TableCaption>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Functions</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>{formFound.name}</Td>
              <Td>{formFound.description}</Td>
              <Td>
                <IconButton
                  onClick={()=>{history.push('form/'+searchAddress)}}
                  aria-label="Edit"
                  icon={<EditIcon />} />
                <IconButton
                  onClick={()=>{history.push('stats/'+searchAddress)}}
                  aria-label="Stats"
                  icon={<InfoIcon />} />
              </Td>
            </Tr>
          </Tbody>
        </Table>
      :null}
    </VStack>
  );
}

export default FormImport;
