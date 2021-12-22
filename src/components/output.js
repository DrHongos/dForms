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
import {useHistory} from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // needed!!!
// CSS Modules, react-datepicker-cssmodules.css
import toast from "react-hot-toast";
import 'react-datepicker/dist/react-datepicker-cssmodules.css';
import { useWeb3Context } from '../contexts/Web3Context';
const Web3 = require('web3');

export default function Output(props) {
  const web3 = new Web3(Web3.givenProvider || 'ws://some.local-or-remote.node:8546');
  const  [ipfsNode, orbit, , myFormsDB, myForms] = useSystemsContext();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { account, providerChainId, loadingWeb3, connectWeb3} = useWeb3Context();
  const { formCID } = useParams()
  const [loading, setLoading] = React.useState(false);
  const [formDataR, setFormDataR] = React.useState();
  const [supported, setSupported] = React.useState();
  const [formObject, setFormObject] = React.useState();
  const [dB, setDB] = React.useState();
  const [prevResponse, setPrevResponse] = React.useState();
  const history = useHistory();

  const getFormCid = (formCID) => {return formCID.split('/form/')}

  React.useEffect(async ()=>{// eslint-disable-line react-hooks/exhaustive-deps
      if(!props.isCreation && ipfsNode){        // this gots into trouble
        setLoading(true)

        let formObj = await getFormData(ipfsNode, getFormCid(formCID))
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

  const createSignedMessage = async () => {
    let signedMessage = web3.eth.personal.sign("Account verification", account, "pass")
    return signedMessage;
  }

  const onSubmit =async (data) => {
    // send a log to the responses DB (keyvalue)
    console.log(data)
    if(data){
      let k;
      if(dB?.access?.contractAddress?.length){
          //create signed message
          k = await createSignedMessage();
      }else{
        k = orbit.id;
      }
      await dB.put(k,data)
      history.push('/stats/'+getFormCid(formCID))
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
          })}
        />
        <FormErrorMessage>
          {errors.name && errors.name.message}
        </FormErrorMessage>
      </FormControl>
    )
    case 'text_field':
    return (
      <Text fontSize='md'>
        {item.name}
      </Text>
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
        defaultValue = {prevResponse?prevResponse[item.name]:false}
        {...register(`${item.name}`, {
          required: item.required,
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
        <NumberInput
          defaultValue = {prevResponse && prevResponse[item.name]?parseFloat(prevResponse[item.name]):0}
          > {/*breaks on register -  max={item.max?item.max:100} min={item.min?item.min:0}*/}
          <NumberInputField
            {...register(`${item.name}`, {
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
        <HStack>
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

          <Input isReadOnly id={item.name.concat('_range')} onChange={(data)=>console.log(data)}
            defaultValue = {prevResponse?prevResponse[item.name]:''}
            {...register(`${item.name}`, {
              max:item.max,
              min:item.min,
            required: true
          })}></Input>
        </HStack>

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
          <HStack>
            <DatePicker
              placeholderText='Select date'
              onChange={(date) => {
                let inputElement = document.getElementById(item.name.concat('_selected'))
                inputElement.value = date.toISOString() //actually should be timestamp.. then frontend converts to local
              }}
              />
            <Input isReadOnly id={item.name.concat('_selected')} onChange={(data)=>console.log(data)}
              defaultValue = {prevResponse?prevResponse[item.name]:''}
              {...register(`${item.name}`, {
              required: true
            })}></Input>
        </HStack>
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
            <Text  fontSize='xl'>{formObject?.name?formObject.name:props.formName}</Text>
            <Text  fontSize='lg' as='i'>{formObject?.description?formObject.description:props.formDescription}</Text>
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
          {!props.isCreation?
            <HStack>
              {supported && dB?
              <Text>Supported!</Text>
              :
              <Button onClick={()=>addSupport(myFormsDB, 'keyvalue', formObject, getFormCid(formCID))}>Support this form!</Button>
              }
              {dB?
                <Button isDisabled={!formObject.responses} type='submit'>Send!</Button>
              :
              <Text>
                Wait your node to connect
              </Text>
            }
            </HStack>
            :
            null
          }
            </VStack>
        </form>
      }
    </Stack>
  );
}
