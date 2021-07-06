import {
  Text,
  VStack,HStack,
  Button,
  Input,
  Spinner,
  FormControl,
  Radio,
  RadioGroup,
  FormLabel,
  Checkbox,
  Spacer,
  Select,
  FormHelperText,
} from '@chakra-ui/react';
import {useSystemsContext} from '../contexts/systems';
import BuilderPage from './formBuilder';
import Output from './output';
import {useState} from 'react';
import {useHistory} from 'react-router-dom';

function CreateForm() {
  const [formData, setFormData] = useState([]);
  const  [ipfsNode, orbit, loading, myForms] = useSystemsContext();
  const [creation, setCreation] = useState(false);
  const [nameForm, setNameForm ] = useState();
  const [description, setDescription ] = useState();
  const [permissions, setPermissions] = useState('public');
  const [keyDefined, setKeyDefined] = useState('orbitdb');
  const [formCreated, setFormCreated] = useState();
  // const [type, setType] = useState('keyvalue');
  // const [permissionsType, setPermissionsType] = useState();
  const history = useHistory();

  const dagPreparation = async (data, options) =>{
  // in put {pin:true} //test this!!
    let cid = await ipfsNode.dag.put(data, options);
    return cid;
  }

// handle databases inside the form OBJECT
// at least, responses.. then can be comments, supporters?,
  async function createDatabase(type, subName){
      let accessController
      let option =permissions // permissionsType?permissionsType:
      let dbName = nameForm.concat(subName)

      switch (option) {
        case 'only':
          accessController = {accessController:{ write: [orbit.identity.id] }}
          break
        case 'orbitdb':
          accessController = {accessController:{type:'orbitdb', write: [orbit.identity.id]}}
          break
        default:
          accessController = {accessController:{ write: ['*']} }
          break
      }

      let db;
      console.log('creating db with access:', accessController)
      db = await orbit.create(dbName, type, accessController)


      if (subName === '.supporters'){
        db.add({key:orbit.identity.id, value:true}) // test this
      }

      console.log('created',db)

      // let orbitdbAddress = db.address.toString().split('/')
      return db.address.toString();
    }

  async function newForm(){
    if(window.confirm('Do you want to create this form?')){
      let responsesDbId = await createDatabase('keyvalue','.responses'); // forced keyvalue?
      let supporters = await createDatabase('feed','.supporters'); // this should be a forced feed

      if(responsesDbId && supporters && formData){
        let newFormObj = {name:nameForm,
                          keyDefined:keyDefined,
                          description:description,
                          responses:responsesDbId,
                          supporters: supporters,
                          formData:formData,
                          created:Date.now()}
        let newFormCid = await dagPreparation(newFormObj,{pin:true}) // DB object

        myForms.add({
          name:nameForm,
          type:'docstore',
          dbAddress:newFormCid.toString(),
          description: description,
          responses: responsesDbId,
          supporters:supporters,
          added: Date.now()
        })

        console.log(newFormCid.toString())
        setFormCreated(newFormCid.toString())
        window.alert('New form created!')
        history.push('/form/'+newFormCid.toString())

        return newFormCid.toString();
      }else{
        return 'Error'
      }
    }else{
      console.log('rejected!')
      return
    }
  }

  return (
      <VStack w='100%'>
        <Text fontSize='md'>Information about the database</Text>
          {!creation?
          <form onSubmit={()=> {
            setCreation(!creation)
          }}>
          <VStack w='100%'>
            <FormControl id="name" isRequired>
              <FormLabel>Name</FormLabel>
              <Input type="string" onChange={e=>setNameForm(e.target.value)}/>
              <FormHelperText>Let's start with a name for your form</FormHelperText>
            </FormControl>

            <FormControl id="description">
              <FormLabel>Description</FormLabel>
              <Input type="string" onChange={e=>setDescription(e.target.value)}/>
              <FormHelperText>Give some extra data for your public</FormHelperText>
            </FormControl>
{/*
            <FormControl id='type'>
              <FormLabel>Type</FormLabel>
              <Select id="type" defaultValue='keyvalue' onChange={(e)=>setType(e.target.value)}>
                <option value="eventlog">EventLog</option>
                <option value="eventlog">Feed</option>
                <option value="keyvalue">Key:Value</option>
                <option value="docstore">Docstore</option>
                <option value="counter">Counter</option>
                </Select>
            </FormControl>
*/}
            <FormControl id='keyDefined' isRequired>
              <FormLabel>Key</FormLabel>
              <Select id="keyDefined" defaultValue='orbitdb' onChange={(e)=>setKeyDefined(e.target.value)}>
                <option value="orbitdb">Orbit db Id</option>
                <option disabled value="free">key value (free)</option>
              </Select>
            </FormControl>

            <HStack>
              <FormControl id="signable">
                <HStack>
                  <FormLabel>Signable</FormLabel>
                  <Checkbox isDisabled/>
                </HStack>
              </FormControl>

              <FormControl id="humans">
                <HStack>
                  <FormLabel>Only humans</FormLabel>
                  <Checkbox isDisabled/>
                </HStack>
              </FormControl>
              <FormControl id="oracle">
                <HStack>
                  <FormLabel>Oracle</FormLabel>
                  <Checkbox isDisabled/>
                </HStack>
              </FormControl>
            </HStack>

            <FormControl  isRequired>
              <FormLabel >Access for your form data</FormLabel>
              <RadioGroup value={permissions} onChange={(value)=>setPermissions(value)}>
                <HStack spacing="24px">
                  <Radio value="public">Public</Radio>
                  <Radio value="only">Only me</Radio>
                  <Radio isDisabled value="access-control">Access Control</Radio>
                  <Radio isDisabled value="encrypted">Encrypted</Radio>
                  <Radio isDisabled value="whitelisted">Whitelisted</Radio>
                </HStack>
              </RadioGroup>
              {/*permissions === 'access-control'?
                <VStack>
                  <Select id="permissions" defaultValue='orbitdb' onChange={(e)=>setPermissionsType(e.target.value)}>
                    <option value="orbitdb" >Orbit DB identity</option>
                  </Select>
                </VStack>
              :null*/}
              <FormHelperText>We are working on expanding your choices!</FormHelperText>
            </FormControl>
            <Button type='submit'>Create!</Button>
          </VStack>
          </form>
          :
          <HStack w='100%'>
            <VStack>

            <BuilderPage
            {...{
              formData,
              setFormData
            }}
            />

            {formCreated?
              <Text>{formCreated}</Text>
            :null}

            </VStack>
            <Spacer />
            {formData?
              <Output
              formData={formData}
              isCreation={true}
              formName={nameForm}
              formDescription={description}
              />
              :null}

          </HStack>
          }
          <Button isDisabled={!formData.length} onClick={()=>newForm()}>Spread!</Button> {/*does not disable correctly*/}

          {loading?
            <VStack>
              <Text fontSize='sm'>Wait until connection is established with IPFS and OrbitDB</Text>
              <Spinner />
            </VStack>
          :null}
      </VStack>
  );
}

export default CreateForm;
