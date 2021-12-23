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
import {CheckIcon} from '@chakra-ui/icons';

export default function Stats(props) {
  const  [ipfsNode, orbit, , myFormsDB,myForms] = useSystemsContext();
  const { formCID } = useParams()
  const [loading, setLoading] = React.useState(true);
  const [formObject, setFormObject] = React.useState();
  const [formDataFiltered, setFormDataFiltered] = React.useState();
  const [responses, setResponses] = React.useState([]);
  const [supported, setSupported] = React.useState();
  const getEntriesKeys = (object) =>{return Object.keys(object)}
  const getFormCid = (formCID) => {return formCID.split('/form/')}

  React.useEffect(async ()=>{// eslint-disable-line react-hooks/exhaustive-deps
      if(ipfsNode){        // this gots into trouble
        setLoading(true)
        let formObj = await getFormData(ipfsNode, getFormCid(formCID))
        // console.log('formobj',formObj)
        //Read responses? create instance of DB
        if(formObj){
          setFormObject(formObj)

          // filtered data is needed to separate question and structure components
          let filteredData = formObj.formData.filter(x =>{
            return !x.type.endsWith('_field')
          }
          )
          setFormDataFiltered(filteredData)
          // console.log('formData', formObj.formData)
          // console.log('filtered', formDataFiltered)

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
            // console.log('resp',resp)
            let respKeys = getEntriesKeys(resp)
            // console.log('flattened',respKeys)
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

  return (
    <Stack>
      {loading?
        <VStack>
          <Spinner />
          <Text>Retrieving the form & responses</Text>
        </VStack>
        :
          <VStack>
            <Text>name: {formObject.name}</Text>
            <Text>description: {formObject.description?formObject.description:'no description'}</Text>
            <Text>Form address:
              <Text
                fontSize='xs'
                color='gray'
                onClick={()=>console.log('https://explore.ipld.io/#/explore/'+formCID)}
                >{formCID}
              </Text>
            </Text>

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
              <Button onClick={()=>{
                addSupport(myFormsDB, 'keyvalue', formObject, getFormCid(formCID))
                setSupported(true)
              }}>Support this form!</Button>
            }
{/*       STATS AND OPERATIONS OVER THE DB SHARED        */}
            {responses?
            <VStack>
              <Text>Responses: {responses.length}</Text>
              <Text>Replication status: </Text>
              <Button isDisabled onClick={()=>console.log('export to csv!')}>Download responses</Button>
            </VStack>
            :null}


{/*            RESULTS               */}
            <Divider/>
            <Table>
            <Thead style={{backgroundColor:'gray'}}>
              {formDataFiltered?
              <Tr key='title'>
                <Td>IPFS Node</Td>
                {formDataFiltered.map(x=>{return(
                  <Td key={x.name}>{x.name}</Td>

                )})}
              </Tr>
              :null}
            </Thead>
            {responses && formDataFiltered?
            <Tbody>
              {responses.map(x=>{return(
                <Tr key={x.key}>
                  <Td key={x.key}>..{x.key.slice(-5,-1)}</Td>
                  {formDataFiltered.map(y=>{return( // ignore '_fields' fields!
                    <Td key={x.key+'-'+y.name}>{x.value[y.name].toString()}</Td>
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
