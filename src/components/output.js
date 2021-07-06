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
import {getDB, getFormData, addSupport, isSupported} from '../logic/databases';
import GoBack from './common/goBack';
import {useHistory} from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // needed!!!
// CSS Modules, react-datepicker-cssmodules.css
import 'react-datepicker/dist/react-datepicker-cssmodules.css';



export default function Output(props) {
  const  [ipfsNode, orbit, , myFormsDB, myForms] = useSystemsContext();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { formCID } = useParams()
  const [loading, setLoading] = React.useState(false);
  const [formCid, setFormCid] = React.useState();
  const [formDataR, setFormDataR] = React.useState();
  const [supported, setSupported] = React.useState();
  const [formObject, setFormObject] = React.useState();
  const [dB, setDB] = React.useState();
  const [prevResponse, setPrevResponse] = React.useState();
  const history = useHistory();

  // const getPublicKey = async () =>{
  //   let ipfsId = await ipfsNode.id();
  //   return ipfsId.publicKey;
  // }

  React.useEffect(async ()=>{// eslint-disable-line react-hooks/exhaustive-deps
      if(!props.isCreation && ipfsNode){        // this gots into trouble
        setLoading(true)

        let cid = formCID.split('/form/')
        setFormCid(cid)

        let formObj = await getFormData(ipfsNode, cid)
        // console.log(formObj)
        //Read responses? create instance of DB
        if(formObj){
          setFormObject(formObj)
          setFormDataR(formObj.formData)
          let support = await isSupported(formObj.responses, myForms)
          setSupported(support)

          let responses = await getDB(orbit, formObj.responses)
          setDB(responses)
          // checkout prev responses, so we update it
          if(responses){
            let prev = await responses.get(orbit.id);
            if(prev){
              setPrevResponse(prev)
              // fill the fields. change the oplog? (it handles well alone)
            }
          }

        }else{
          setFormObject({})
        }
        setLoading(false)
      }
  },[formCID, ipfsNode, props.isCreation, orbit]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit =async (data) => {
    // send a log to the responses DB (keyvalue)
    // here! checkout if prev responses to update!
    console.log(data)
    if(data){
      await dB.put(orbit.id,data)
      history.push('/stats/'+formCid)
    }else{
      console.log('answer the damn form!')
    }
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
      <FormControl key={item.name} isInvalid={errors.name} isRequired={item.required}>
        <FormLabel htmlFor="name">{item.name}</FormLabel>
        <Input
          id={item.name}
          defaultValue = {prevResponse?prevResponse[item.name]:''}
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
      <FormControl key={item.name} isInvalid={errors.name} isRequired={item.required}>
        <FormLabel htmlFor="name">{item.name}</FormLabel>
        <Input
          id={item.name}
          defaultValue = {prevResponse?prevResponse[item.name]:''}
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
      <FormControl key={item.name} isRequired={item.required}>
        <FormLabel>{item.name}</FormLabel>
        <Select
        defaultValue = {prevResponse?prevResponse[item.name]:''}
        placeholder={item.name}
        {...register(`${item.name}`, {
          required: item.required,
          pattern:item.pattern
        })}>
          {optionsSelect.map(x=>{return(
            <option value={x} key={x}>{x}</option>
          )})}
        </Select>
      </FormControl>
    );
    case 'checkbox':
    return (
      <FormControl key={item.name} isRequired={item.required}>
        <FormLabel>{item.name }</FormLabel>
        <Checkbox
        defaultValue = {prevResponse?prevResponse[item.name]:''}
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
      <FormControl key={item.name} isRequired={item.required}>
        <FormLabel>{item.name}</FormLabel>
        <RadioGroup
          defaultValue = {prevResponse?prevResponse[item.name]:''}
        >
        <Stack>
        {optionsRadio.map((x)=>{return(
          <Radio value={x} key={x} {...register(`${item.name}`,{required:true})}>{x}</Radio>
        )})}
        </Stack>

        </RadioGroup>
      </FormControl>
    );
    case 'number':
    return (
      <FormControl key={item.name} id={item.name} isRequired={item.required}>
        <FormLabel>{item.name}</FormLabel>
        <NumberInput> {/*breaks on register -  max={item.max?item.max:100} min={item.min?item.min:0}*/}
          <NumberInputField {...register(`${item.name}`, {
            required: item.required,
            max:item.max,
            min:item.min,
          })} />
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
      <FormControl
        key={item.name}
        id={item.name}
        isRequired={item.required}
        >
        <FormLabel>{item.name}</FormLabel>
        <Slider
          min={minimum}
          max={maximum}
          defaultValue = {prevResponse?prevResponse[item.name]:minimum}
          onChangeEnd={(value) => {
            let interf = document.getElementById(item.name.concat('_range'))
            interf.value = value
          }}
          >
          <SliderTrack
          bg="red.100">
            <Box position="relative" right={10} />
            <SliderFilledTrack bg="tomato" />
          </SliderTrack>
          <SliderThumb boxSize={6}></SliderThumb>
        </Slider>

        <Input id={item.name.concat('_range')} onChange={(data)=>console.log(data)}
          defaultValue = {prevResponse?prevResponse[item.name]:''}
          {...register(`${item.name}`, {
            max:item.max,
            min:item.min,
          required: true
        })}></Input>

      </FormControl>
    );
    case 'email':
    return (
      <FormControl key={item.name} id={item.name} isRequired={item.required}>
        <FormLabel>Email address</FormLabel>
        <Input
          defaultValue = {prevResponse?prevResponse[item.name]:''}
          type="email" {...register(`${item.name}`, {
            required: item.required,
            maxLength:item.maxLength ,
            max:item.max,
            min:item.min,
            pattern:item.pattern
          })} />
        <FormHelperText>dont enter your email. This is a public and open database!</FormHelperText>
      </FormControl>
    );
    case 'datetime':
      // {/*showTimeSelect dateFormat="Pp"*/}
      // {/*Datetime pickers need to be referred to its item.name also for later*/}
      return (
        <FormControl id={item.name} isRequired={item.required} key={item.name}>
          <FormLabel>{item.name}</FormLabel>
          <DatePicker
            placeholderText='Select date'
            onChange={(date) => {
              let inputElement = document.getElementById(item.name.concat('_selected'))
              inputElement.value = date.toISOString() //actually should be timestamp.. then frontend converts to local
            }}
            />
          <Input id={item.name.concat('_selected')} onChange={(data)=>console.log(data)}
            defaultValue = {prevResponse?prevResponse[item.name]:''}
            {...register(`${item.name}`, {
            required: true
          })}></Input>
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
            <Text  fontSize='md'>{formObject?.name?formObject.name:props.formName}</Text>
            <Text  fontSize='sm'>{formObject?.description?formObject.description:props.formDescription}</Text>
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
              {supported?
              <Text>Supported!</Text>
              :
              <Button onClick={()=>addSupport(myFormsDB, 'keyvalue', formObject, formCid)}>Support this form!</Button>
              }
              <Button isDisabled={!formObject.responses} type='submit'>Send!</Button>
            </HStack>
            :null}
            {/*      await db.add({key:key,value:ipfsCid.string})*/}
            </VStack>
        </form>
      }
    </Stack>
  );
}
