import React from 'react';
import { useForm } from 'react-hook-form';
import {
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button,
  Select,
  Radio,
  RadioGroup,
  Divider,
  VStack,
  Checkbox,
  Text,
  HStack,
  Slider,
  SliderTrack,
  Box,
  SliderThumb,
  SliderFilledTrack,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,

  Spinner
} from "@chakra-ui/react";
import {useSystemsContext} from './../contexts/systems';
import {useParams} from 'react-router-dom';
import {getDB} from '../logic/databases';


export default function Stats(props) {
  const  [ipfsNode, orbit, loadingGeneral, myForms] = useSystemsContext();
  // const { register, handleSubmit, formState: { errors } } = useForm();
  const { formCID } = useParams()
  const [loading, setLoading] = React.useState(true);
  const [formCid, setFormCid] = React.useState();
  const [formDataR, setFormDataR] = React.useState();
  const [responsesId, setResponsesId] = React.useState();
  const [formName, setFormName] = React.useState();
  const [formDescription, setFormDescription] = React.useState();
  const [dB, setDB] = React.useState();
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
      console.log(result)
      return result
    }
  }
  let  formObj
  React.useEffect(async ()=>{
      if(ipfsNode){        // this gots into trouble
        setLoading(true)

        let cid = formCID.split('/form/')
        setFormCid(cid)

        let formObj = await getFormData(cid)
        // console.log(formObj.formData)
        //Read responses? create instance of DB
        if(formObj){
          setResponsesId(formObj.responses)
          setFormName(formObj.name)
          setFormDescription(formObj.description)
          let db = await getDB(orbit, formObj.responses)
          setDB(db)
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
  },[formCID, ipfsNode])


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

  let options;

  return (
    <Stack>
      {loading?
        <VStack>
          <Spinner />
          <Text>Retrieving the form & responses</Text>
        </VStack>
        :
          <VStack>
            <Text>{formName}</Text>
            <Text>{formDescription?formDescription:null}</Text>
            <Button onClick={()=>{addSupport()}}>Support this form!</Button> {/*isDisabled={form in myForms}*/}
            <Text>General Responses</Text>
            <Text>Manage different kind of forms with its properties</Text>

            <Text>Responses</Text>
            <Divider/>
            <Table>
            <Thead>
              <Tr>
                <Td>IPFS Node</Td>
                {formDataR.map(x=>{return(
                  <Td>{x.name}</Td>

                )})}
              </Tr>
            </Thead>
            <Tbody>
              {responses.map(x=>{return(
                <Tr>
                  <Td>{x.payload.value.key.slice(0,5)}..</Td>
                  {formDataR.map(y=>{return(
                    <Td>{x.payload.value.value[y.name]}</Td>
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
