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
import {getDB} from '../logic/databases';
import GoBack from './common/goBack';
import {CheckIcon} from '@chakra-ui/icons';

export default function Stats(props) {
  const  [ipfsNode, orbit, , myForms,entries] = useSystemsContext();
  const { formCID } = useParams()
  const [loading, setLoading] = React.useState(true);
  const [formCid, setFormCid] = React.useState();
  const [formDataR, setFormDataR] = React.useState();
  const [responsesId, setResponsesId] = React.useState();
  const [formName, setFormName] = React.useState();
  const [formDescription, setFormDescription] = React.useState();
  // const [dB, setDB] = React.useState();
  const [formSupported, setFormSupported] = React.useState();
  const [responses, setResponses] = React.useState([]);

  const addSupport = async()=>{
    let type='eventlog'
    myForms.add({
      name:formName,
      type,
      formDataCid:formCid,
      description: formDescription,
      responses: responsesId,
      added: Date.now()
    })
    console.log('added!')
  }


  const getFormData = async (cid) =>{
    for await (const result of ipfsNode.cat(cid.toString())) {
      // console.log(result)
      return result
    }
  }

  const isSupported = (id) => {
    if(entries && entries.length > 0){
      let entriesIds = entries.map(x=>{return (x.payload.value.responses)})
      // console.log('entriesIds',entriesIds)
      return entriesIds.includes(id)
    }
    return false;
  }

  React.useEffect(async ()=>{// eslint-disable-line react-hooks/exhaustive-deps
      if(ipfsNode){        // this gots into trouble
        setLoading(true)

        let cid = formCID.split('/form/')
        setFormCid(cid)

        let formObj = await getFormData(cid)
        // console.log('formobj',formObj)
        //Read responses? create instance of DB
        if(formObj){
          setResponsesId(formObj.responses)
          setFormName(formObj.name)
          setFormDescription(formObj.description)
          setFormSupported(isSupported(formObj.responses))
          let db = await getDB(orbit, formObj.responses)
          // setDB(db)
          if(db){
            let resp
            resp = await db.iterator({ limit: 100 }).collect().reverse()
            setResponses([...resp])
          }


        }
        try{
          let formDataArray = await getFormData(formObj.formData)
          setFormDataR(formDataArray.formData)
        }catch{
          return 'error'
        }
        setLoading(false)
      }
  },[formCID, ipfsNode, orbit, myForms])// eslint-disable-line react-hooks/exhaustive-deps


  //responsesId database in

  // export const dagPreparation = async (data) =>{
  // // in put {pin:true} //test this!!
  //   let cid = await ipfsNode.dag.put(data);
  //   return cid;
  // }

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
            <Text>{formName}</Text>
            <Text>{formDescription?formDescription:null}</Text>
            {formSupported?
              <HStack>
                <Text>Form supported </Text>
                <CheckIcon />
              </HStack>
            :
              <Button onClick={()=>{addSupport()}}>Support this form!</Button>
            }
            <Text>General Responses</Text>
            <Text>Manage different kind of forms with its properties</Text>
            <HStack>
              <Text>Responses: {entries.length}</Text>
              <Button isDisabled onClick={()=>console.log('export to csv!')}>Download responses</Button>
            </HStack>
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
            <Tbody>
              {responses.map(x=>{return(
                <Tr>
                  <Td>..{x.payload.value.key.slice(-5,-1)}</Td>
                  {formData.map(y=>{return(
                    <Td>{x.payload.value.value[y.name].toString()}</Td>
                  )}

                  )}
                </Tr>
              )})}
            </Tbody>
            </Table>
        </VStack>
      }
    </Stack>
  );
}
