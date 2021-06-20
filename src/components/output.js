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
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberIncrementStepper,
  HStack,
  Slider,
  SliderTrack,
  Box,
  SliderThumb,
  SliderFilledTrack,
  Stack,
  Spinner
} from "@chakra-ui/react";
import {useSystemsContext} from './../contexts/systems';
import {useParams} from 'react-router-dom';
import {getDB} from '../logic/databases';
import GoBack from './common/goBack';


export default function Output(props) {
  const  [ipfsNode, orbit, , myForms] = useSystemsContext();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { formCID } = useParams()
  const [loading, setLoading] = React.useState(false);
  const [formCid, setFormCid] = React.useState();
  const [formDataR, setFormDataR] = React.useState();
  const [responsesId, setResponsesId] = React.useState();
  const [formName, setFormName] = React.useState();
  const [formDescription, setFormDescription] = React.useState();
  const [dB, setDB] = React.useState();

  const getPublicKey = async () =>{
    let ipfsId = await ipfsNode.id();
    return ipfsId.publicKey;
  }

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
  React.useEffect(async ()=>{// eslint-disable-line react-hooks/exhaustive-deps
      if(!props.isCreation && ipfsNode){        // this gots into trouble
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

        }
        try{
          let formDataArray = await getFormData(formObj.formData)
          setFormDataR(formDataArray.formData)
        }catch{
          return 'error'
        }
        setLoading(false)
      }
  },[formCID, ipfsNode, props.isCreation, orbit]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit =async (data) => {
    // send a log to the responses DB
    await dB.add({key:await getPublicKey(), value:data})
    console.log(data)
  };
  const onError = error =>{
    console.log(error);
  }

// switch for different elements possible in formData,
  let formData
  if(props.isCreation){
    formData = props.formData;
  }else{
    formData = formDataR
  }

  // let options;
const formElement = (item) => {
  // let type;
  switch (item.type) {
    case 'text':
    return (
      <FormControl isInvalid={errors.name} isRequired={item.required}>
        <FormLabel htmlFor="name">{item.name}</FormLabel>
        <Input
          id={item.name}
          placeholder={item.name}
          {...register(`${item.name}`, {
            required: item.required,
            maxLength:item.maxLength ,
            max:item.max,
            min:item.min,
            pattern:item.pattern
          })}
        />
        <FormErrorMessage>
          {errors.name && errors.name.message}
        </FormErrorMessage>
      </FormControl>
    )
    case 'textarea':
    return (
      <FormControl isInvalid={errors.name} isRequired={item.required}>
        <FormLabel htmlFor="name">{item.name}</FormLabel>
        <Input
          id={item.name}
          placeholder={item.name}
          {...register(`${item.name}`, {
            required: item.required?true:false,
            maxLength:item.maxLength?item.maxLength:128 ,
            pattern:item.pattern?item.pattern:null
          })}
        />
        <FormErrorMessage>
          {errors.name && errors.name.message}
        </FormErrorMessage>
      </FormControl>
    )
    case 'select':
    let optionsSelect = item.options.split(';');
    return (
      <FormControl isRequired={item.required}>
        <FormLabel>{item.name}</FormLabel>
        <Select placeholder={item.name}
        {...register(`${item.name}`, {
          required: item.required,
          pattern:item.pattern
        })}>
          {optionsSelect.map(x=>{return(
            <option value={x}>{x}</option>
          )})}
        </Select>
      </FormControl>
    );
    case 'checkbox':
    return (
      <FormControl isRequired={item.required}>
        <FormLabel>{item.name }</FormLabel>
        <Checkbox
        {...register(`${item.name}`, {
          required: item.required,
          pattern:item.pattern
        })}
         />
      </FormControl>
    );
    case 'radio':
    let optionsRadio = item.options.split(';');
    return (
      <FormControl isRequired={item.required}>
        <FormLabel>{item.name}</FormLabel>
        <RadioGroup>
        <Stack>
        {optionsRadio.map((x)=>{return(
          <Radio value={x} {...register(`${item.name}`,{required:true})}>{x}</Radio>
        )})}
        </Stack>

        </RadioGroup>
      </FormControl>
    );
    case 'number':
    return (
      <FormControl id={item.name} isRequired={item.required}>
        <FormLabel>{item.name}</FormLabel>
        <NumberInput max={item.max?item.max:100} min={item.min?item.min:0}> {/*breaks on register*/}
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>    );

    case 'range':
    let maximum = item.max? item.max : 100
    let minimum = item.min? item.min : 0
    return (
      <FormControl id={item.name} isRequired={item.required} >
        <FormLabel>{item.name}</FormLabel>
        <Slider min={minimum} max={maximum} onChangeEnd={(value) => console.log(value)}>
          <SliderTrack bg="red.100">
            <Box position="relative" right={10} />
            <SliderFilledTrack bg="tomato" />
          </SliderTrack>
          <SliderThumb boxSize={6}>{item.name.value}</SliderThumb>
        </Slider>

        <Text></Text>
      </FormControl>
    );
    case 'email':
    return (
      <FormControl id={item.name} isRequired={item.required}>
        <FormLabel>Email address</FormLabel>
        <Input type="email" {...register(`${item.name}`, {
          required: item.required,
          maxLength:item.maxLength ,
          max:item.max,
          min:item.min,
          pattern:item.pattern
        })} />
        <FormHelperText>dont enter your email. This is a public and open database!</FormHelperText>
      </FormControl>
    );
    default:
    return null;
  }
  };

  return (
    <Stack>
      {loading?
        <VStack>
          <Spinner />
          <Text>Retrieving the form..</Text>
        </VStack>
        :
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <VStack>
            <Text>{formName}</Text>
            <Text>{formDescription?formDescription:null}</Text>
          </VStack>
          <VStack>
          {formData && formData.length > 0?
            <VStack>
              {formData.map(x=>{return(
                  formElement(x)
                )})}
              <Divider />
            </VStack>
          :null}
          {!props.isCreation && dB?
            <HStack>
              <GoBack
                path='/'
              />

              <Button onClick={()=>addSupport()}>Support this form!</Button>
              <Button isDisabled={!responsesId} type='submit'>Send!</Button>
            </HStack>
            :null}
            {/*      await db.add({key:key,value:ipfsCid.string})*/}
            </VStack>
        </form>
      }
    </Stack>
  );
}
