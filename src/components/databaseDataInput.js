import {
  Text,
  VStack,HStack,
  Button,
  Input,
  FormControl,
  Radio,
  RadioGroup,
  FormLabel,
  Checkbox,
  Select,
  FormHelperText,
} from '@chakra-ui/react';

function DatabaseDataInput(props) {

  return (
      <VStack w='100%'>
        <Text fontSize='md'>Information of the form, keys and access</Text>
          <form onSubmit={()=> {
            props.setCreation(!props.creation)
          }}>
          <VStack w='100%'>
            <FormControl id="name" isRequired>
              <FormLabel>Title</FormLabel>
              <Input type="string" onChange={e=>props.setNameForm(e.target.value)}/>
              <FormHelperText>Let's start with a name for your form</FormHelperText>
            </FormControl>

            <FormControl id="description">
              <FormLabel>Description</FormLabel>
              <Input type="string" onChange={e=>props.setDescription(e.target.value)}/>
              <FormHelperText>Give some extra data for your public</FormHelperText>
            </FormControl>

            {props.setType?
            <FormControl id='type'>
              <FormLabel>Type</FormLabel>
              <Select id="type" defaultValue='keyvalue' onChange={(e)=>props.setType(e.target.value)}>
                <option value="eventlog">EventLog</option>
                <option value="eventlog">Feed</option>
                <option value="keyvalue">Key:Value</option>
                <option value="docstore">Docstore</option>
                <option value="counter">Counter</option>
                </Select>
            </FormControl>
            :null}

            {props.setKeyDefined?
            <FormControl id='keyDefined' isRequired>
              <FormLabel>Key</FormLabel>
              <Select id="keyDefined" defaultValue='orbitdb' onChange={(e)=>props.setKeyDefined(e.target.value)}>
                <option value="orbitdb">Orbit db Id</option>
                <option disabled value="free">key value (free)</option>
              </Select>
            </FormControl>
            :null}

            {props.TODO?
            <HStack>
              <FormControl id="signable">
                <HStack>
                  <FormLabel>Signable</FormLabel>
                  <Checkbox isDisabled/>
                </HStack>
              </FormControl>
              <FormControl id="encrypted">
                <HStack>
                  <FormLabel>Encrypted data</FormLabel>
                  <Checkbox isDisabled onChange={() => props.setPohControl()}/>
                </HStack>
              </FormControl>
              <FormControl id="oracle">
                <HStack>
                  <FormLabel>Oracle</FormLabel>
                  <Checkbox isDisabled/>
                </HStack>
              </FormControl>
            </HStack>
            :null}

            {props.setPermissions?
            <FormControl  isRequired>
              <FormLabel >Access for your form data</FormLabel>
              <RadioGroup value={props.permissions} onChange={(value)=>props.setPermissions(value)}>
                <HStack spacing="24px">
                  <Radio value="public">Public</Radio>
                  <Radio value="only">Only me</Radio>
                  <Radio value="poh">Proof of humanity</Radio>
                  <Radio isDisabled value="whitelisted">Whitelisted</Radio>
                  <Radio isDisabled value="daohaus">DaoHaus members</Radio>
                </HStack>
              </RadioGroup>
              {props.permissions === 'access-control'?
                <VStack>
                  <Select id="permissions" defaultValue='orbitdb' onChange={(e)=>props.setPermissionsType(e.target.value)}>
                    <option value="orbitdb" >Orbit DB identity</option>
                  </Select>
                </VStack>
              :null}
              <FormHelperText>We are working on expanding your choices!</FormHelperText>
            </FormControl>
            :null}

            <Button type='submit'>Create!</Button>
          </VStack>
          </form>

      </VStack>
  );
}

export default DatabaseDataInput;
