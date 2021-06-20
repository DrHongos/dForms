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
  IconButton,
  Checkbox,
  FormHelperText,
} from '@chakra-ui/react';
import {useSystemsContext} from './../contexts/systems';
import BuilderPage from './formBuilder';
import Output from './output';
import {useState} from 'react';
import { useStateMachine } from "little-state-machine";
import GoBack from './common/goBack';
import copyClipBoard from "../logic/copyClipBoard"
import { CopyIcon } from '@chakra-ui/icons';
import {useHistory} from 'react-router-dom';
function CreateForm() {
  const {
    state: { formData = [] },
  } = useStateMachine()
  const  [ipfsNode, orbit, loading, myForms] = useSystemsContext();
  const [creation, setCreation] = useState(false);
  const [toggleBuilder ,setToggleBuilder] = useState(true);
  const [nameForm, setNameForm ] = useState();
  const [description, setDescription ] = useState();
  const [permissions, setPermissions] = useState('public');
  const [formCreated, setFormCreated] = useState();
  const history = useHistory();

  const dagPreparation = async (data) =>{
  // in put {pin:true} //test this!!
    let cid = await ipfsNode.dag.put(data);
    return cid;
  }

  async function createDatabase(){
      let accessController
      let type ='eventlog'
      switch (permissions) {
        case 'public':
          accessController = { write: ['*'] }
          break
        default:
          accessController = { write: [orbit.identity.id] }
          break
      }
      const db = await orbit.create(nameForm, type, { accessController })

      return db.address.toString();
    }

  async function newForm(){
    if(window.confirm('Do you want to create this form?')){
      let responsesDbId = await createDatabase();
      // let formDataJson = JSON.stringify(formData);// parse:error
      const type = 'eventlog';
      const formDataCid = await dagPreparation({formData})
      if(responsesDbId && formDataCid){
        let newFormObj = {name:nameForm,description:description,responses:responsesDbId, formData:formDataCid}
        let newFormCid = await dagPreparation(newFormObj)

        myForms.add({
          name:nameForm,
          type,
          formDataCid:newFormCid.toString(),
          description: description,
          responses: responsesDbId,
          added: Date.now()
        })

        console.log(newFormCid.toString())
        setFormCreated(newFormCid.toString())
        window.alert('New form created!')
        history.push('/form/'+newFormCid.toString())

        return newFormCid.toString();
        // Add to DB root?
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
        <GoBack
          path='/'
        />
        <Text fontSize='md'>Create your form</Text>
        <Text color='red' fontSize='sm'>Remember this is unencrypted and public!</Text>
          {!creation?
          <form onSubmit={()=> setCreation(!creation)}>
          <VStack>
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
              <FormLabel >Access for your form</FormLabel>
              <RadioGroup value={permissions} onChange={(value)=>setPermissions(value)}>
                <HStack spacing="24px">
                  <Radio value="public">Public</Radio>
                  <Radio isDisabled value="encrypted">Encrypted</Radio>
                  <Radio isDisabled value="whitelisted">Whitelisted</Radio>
                </HStack>
              </RadioGroup>
              <FormHelperText>We are working on expanding your choices!</FormHelperText>
            </FormControl>
            <Button type='submit'>Create!</Button>
          </VStack>
          </form>
          :
          <HStack w='50%'>
            <VStack>
            <BuilderPage
              showBuilder={toggleBuilder}
              toggleBuilder={()=>setToggleBuilder(!toggleBuilder)}
              HomeRef='/'
              isStatic={!toggleBuilder} // what is this???
              defaultLang='en'
              newForm ={newForm}
            />
            {formCreated?
              <HStack>
                <Text>{formCreated}</Text>
                <IconButton
                  icon={<CopyIcon />}
                  onClick={()=>copyClipBoard('localhost:3000/#/form/'+formCreated)}
                  />
              </HStack>
            :null}

            </VStack>
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
