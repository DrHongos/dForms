import {
  Text,
  VStack,HStack,
  Button,
  Spinner,
  Spacer,
  Divider,
} from '@chakra-ui/react';
import {useSystemsContext} from '../contexts/systems';
import BuilderPage from './formBuilder';
import Output from './output';
import DatabaseDataInput from './databaseDataInput';
import {useState} from 'react';
import {useHistory} from 'react-router-dom';
const Web3 = require('web3');

function CreateForm() {
  const [formData, setFormData] = useState([]);
  const [ipfsNode, orbit, loading, myForms] = useSystemsContext();
  const [creation, setCreation] = useState(false);
  const [nameForm, setNameForm ] = useState();
  const [description, setDescription ] = useState();
  const [keyDefined, setKeyDefined] = useState('orbitdb');
  const [pohControl, setPohControl] = useState(false);
  const web3Provider = new Web3(window.ethereum);
  // const [permissions, setPermissions] = useState('public');
  // const [type, setType] = useState('keyvalue');
  const history = useHistory();

  const dagPreparation = async (data, options) =>{
  // in put {pin:true} //test this!!
    let cid = await ipfsNode.dag.put(data, options);
    return cid;
  }

  let permissions = 'public';

// handle databases inside the form OBJECT
// at least, responses.. then can be comments, supporters?,
// add the different approaches of access controller needed
  async function createDatabase(type, subName){
      let accessController
      let option =permissions // permissionsType?permissionsType:permissions
      let dbName = nameForm.concat(subName)
      if(pohControl){
        option = 'poh';
      }
      switch (option) {
        case 'only':
          accessController = {accessController:{ write: [orbit.identity.id] }}
          break
        case 'orbitdb':
          accessController = {accessController:{type:'orbitdb', write: [orbit.identity.id]}}
          break
        case 'poh':
          accessController = {accessController:{
            type: 'ProofOfHumanity',
            ipfs: ipfsNode,
            web3: web3Provider
          }}
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
      // let supporters = await createDatabase('feed','.supporters'); // this should be a forced feed

      if(responsesDbId  && formData){
        let newFormObj = {name:nameForm,
                          keyDefined:keyDefined,
                          description:description,
                          responses:responsesDbId,
                          // supporters: supporters,
                          formData:formData,
                          created:Date.now()}
        let newFormCid = await dagPreparation(newFormObj,{pin:true}) // DB object

        myForms.add({
          name:nameForm,
          type:'docstore',
          dbAddress:newFormCid.toString(),
          description: description,
          responses: responsesDbId,
          // supporters:supporters,
          added: Date.now()
        })

        console.log('created: ',newFormCid.toString())
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

  function changePohControl(){
    setPohControl(!pohControl);
  }

  return (
      <VStack w='100%'>
        <Text fontSize='xl'>Creating a form</Text>
        <Divider />
          {!creation?
            <DatabaseDataInput
              creation = {creation}
              setCreation = {setCreation}
              setNameForm = {setNameForm}
              setDescription = {setDescription}
              setKeyDefined = {setKeyDefined}
              setType = {false}
              setPohControl = {changePohControl}
              permissions = {permissions}
              setPermissions = {false} // error in databaseDataInput (setPermissions is overriden in state)
              setPermissionsType = {false}
              TODO = {true}
            />
          :
          <HStack w='100%'>
            <VStack>
              <BuilderPage
              {...{
                formData,
                setFormData
              }} />
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
