import React from 'react';
import {
  Button,
  Divider,
  VStack,
  Text,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Spinner,
  HStack
} from "@chakra-ui/react";
import {useSystemsContext} from './../contexts/systems';
import {useParams} from 'react-router-dom';
import {getDB, getFormData, addSupport, isSupported} from '../logic/databases';
import GoBack from './common/goBack';
import {CheckIcon} from '@chakra-ui/icons';

export default function Stats(props) {
  const  [ipfsNode, orbit, , myFormsDB,myForms] = useSystemsContext();
  const { formCID } = useParams()
  const [loading, setLoading] = React.useState(true);
  const [formCid, setFormCid] = React.useState();
  const [formDataR, setFormDataR] = React.useState();
  const [formObject, setFormObject] = React.useState();
  // const [responsesDB, setResponsesDB] = React.useState();
  const [responses, setResponses] = React.useState([]);
  // const [supportersDB, setSupportersDB] = React.useState();
  const [supported, setSupported] = React.useState();

  const getEntriesKeys = (object) =>{return Object.keys(object)}


  React.useEffect(async ()=>{// eslint-disable-line react-hooks/exhaustive-deps
      if(ipfsNode){        // this gots into trouble
        setLoading(true)

        let cid = formCID.split('/form/')
        setFormCid(cid)

        let formObj = await getFormData(ipfsNode, cid)
        // console.log('formobj',formObj)
        //Read responses? create instance of DB
        if(formObj){
          setFormObject(formObj)
          setFormDataR(formObj.formData)
          //
          let support = await isSupported(formObj.responses, myForms)
          setSupported(support)
// GET DATABASE OBJECT AND DATA
          let resp;
          let db = await getDB(orbit, formObj.responses)
          // setResponsesDB(db)
          if(db && db.type === 'eventlog'){
            resp = await db.iterator({ limit: 100 }).collect().reverse()
            setResponses([...resp])
          }else if(db && db.type==='keyvalue'){
            resp = await db.all
            console.log('resp',resp)
            let respKeys = getEntriesKeys(resp)
            console.log('flattened',respKeys)
            let flattened = respKeys.reduce((total, currentValue) => total.concat({key:currentValue, value:resp[currentValue]}), []);
            setResponses(flattened)
          }else if(db){ // feed, docstore and counter (or customs)
              resp = await db.all
              setResponses(resp)
          }else{
            setResponses()
          }
        }
        setLoading(false)
      }
  },[formCID, ipfsNode, orbit, myForms])// eslint-disable-line react-hooks/exhaustive-deps


// switch for different elements possible in formData,
  let formData
  if(props.isCreation){
    formData = props.formData;
  }else{
    formData = formDataR
  }

  return (
    <Stack>
      <GoBack
        path='/'
      />

      {loading?
        <VStack>
          <Spinner />
          <Text>Retrieving the form & responses</Text>
        </VStack>
        :
          <VStack>
            <Text>name: {formObject.name}</Text>
            <Text>description: {formObject.formDescription?formObject.formDescription:'no description'}</Text>
            <Text>Form address: <Text fontSize='xs' color='gray'>{formCID}</Text></Text>

{/*
            <Text>orbit db responses address: {dB.id}</Text>
            HANDLE ANSWERS WITH OPTIONS TO CALCULATE
            <Text>General Responses</Text>
            <Text>Manage different kind of forms with its properties</Text>
*/}

            {supported?
              <HStack>
              <Text>Form supported </Text>
              <CheckIcon />
              </HStack>
              :
              <Button onClick={()=>{addSupport(myFormsDB, 'keyvalue', formObject, formCid)}}>Support this form!</Button>
            }
{/*       STATS AND OPERATIONS OVER THE DB SHARED        */}
            {responses?
            <VStack>
              <Text>Responses: {responses.length}</Text>
              <Text>Replication status: </Text>
              <Text>Supporters: </Text>
              <Button isDisabled onClick={()=>console.log('export to csv!')}>Download responses</Button>
            </VStack>
            :null}


{/*            RESULTS               */}
            <Divider/>
            <Table>
            <Thead style={{backgroundColor:'gray'}}>
              <Tr>
                <Td>IPFS Node</Td>
                {formData.map(x=>{return(
                  <Td>{x.name}</Td>

                )})}
              </Tr>
            </Thead>
            {responses?
            <Tbody>
              {responses.map(x=>{return(
                <Tr>
                  <Td>..{x.key.slice(-5,-1)}</Td>
                  {formData.map(y=>{return(
                    <Td>{x.value[y.name].toString()}</Td>
                  )}

                  )}
                </Tr>
              )})}
            </Tbody>
            :null}
            </Table>
        </VStack>
      }
    </Stack>
  );
}
