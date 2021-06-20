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
      return newFormCid.toString();
      // Add to DB root?
    }else{
      return 'Error'
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

            <FormControl as="open" isRequired>
              <FormLabel as="legend">Access for your form</FormLabel>
              <RadioGroup defaultValue="Public" onChange={(value)=>setPermissions(value)}>
                <HStack spacing="24px">
                  <Radio value="public">Public</Radio>
                  <Radio disabled value="encrypted">Encrypted</Radio>
                  <Radio disabled value="whitelisted">Whitelisted</Radio>
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
              HomeRef='https://react-hook-form.com/form-builder'
              isStatic={!toggleBuilder} // what is this???
              defaultLang='en'
            />
            <Button onClick={()=>newForm()}>Spread!</Button>
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
