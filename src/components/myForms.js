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
  Divider,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  HStack,
  Button,
} from '@chakra-ui/react';
import {DeleteIcon, EditIcon, InfoIcon, CopyIcon } from '@chakra-ui/icons';
import {useHistory} from 'react-router-dom';
import {useSystemsContext} from './../contexts/systems';
import copyClipBoard from "../logic/copyClipBoard"
import GoBack from './common/goBack';
import {useState} from 'react';

function MyForms() {
  const history = useHistory();
  const  [ipfsNode, , , myForms, entries] = useSystemsContext();
  const [searchAddress, setSearchAddress] = useState();
  const [formFound, setFormFound] = useState();


  const removeDatabase = async (hash) => {
    if(window.confirm("Do you really want to unsupport this form?")){
      console.log('deleted!')
      return myForms.remove(hash.hash)
    }else{
      console.log('Rejected by the user')
    }
    // react to the entries change.. (refresh?)
  }

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
      <GoBack
        path='/'
      />
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
      <Divider />
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
                    onClick={()=>copyClipBoard('localhost:3000/#/form/'+x.payload.value.dbAddress)}
                    aria-label="Copy"
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
