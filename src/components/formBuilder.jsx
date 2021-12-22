// copied from https://github.com/react-hook-form/documentation/blob/master/src/components/BuilderPage.tsx
//also check : https://github.com/dgonz64/react-hook-form-auto#readme

import * as React from "react"
import { useForm } from "react-hook-form"
import {Input, Select,  HStack,VStack, Text, Button, Flex, Divider} from '@chakra-ui/react';
import FormCreatorItem from './formCreatorItem';
import {AddIcon,EditIcon} from '@chakra-ui/icons';
const { useState, useRef, useEffect } = React

const errorStyle = {
  border: `1px solid black`,
  background: '#2f4f4f',
}
//
const defaultValue = {
  max: undefined,
  min: undefined,
  pattern: undefined,
  maxLength: undefined,
  minLength: undefined,
  required: undefined,
  name: "",
  type: "",
  options: [],
}

function BuilderPage({formData, setFormData}) {
  const [editFormData, setEditFormData] = useState(defaultValue)
  const {
    register,
    handleSubmit,
    errors = {},
    watch,
    setValue,
    reset,
  } = useForm()
  const [editIndex, setEditIndex] = useState(-1)
  const copyFormData = useRef([])
  const [attr, setAttr] = useState(false)
  // const [showValidation, toggleValidation] = useState(false)
  const onSubmit = (data) => {
    if (editIndex >= 0) {
      formData[editIndex] = data
      setFormData([...formData])
      setEditFormData(defaultValue)
      setEditIndex(-1)
    } else {
      setFormData([...formData, ...[data]])
    }
    reset()
  }
  const form = useRef(null)
  const type = watch("type")
  const shouldToggleOn =
    editFormData.max ||
    editFormData.min ||
    editFormData.pattern ||
    editFormData.maxLength ||
    editFormData.minLength ||
    editFormData.required
  copyFormData.current = formData
  const editIndexRef = useRef(null)
  editIndexRef.current = editIndex

  const validate = (value) => {
    return (
      !Object.values(copyFormData.current).find(
        (data) => data.name === value
      ) || editIndexRef.current !== -1
    )
  }

  useEffect(()=>{
    if(editIndex>-1){ // do it for all kind of patterns
      setValue('name', formData[editIndex].name)
      setValue('required', formData[editIndex].required)
      setValue('type', formData[editIndex].type)
    }
  },[editIndex, setValue, formData])

  useEffect(() => {
    setValue("toggle", shouldToggleOn)
  }, [shouldToggleOn, setValue])
  //
  useEffect(() => {
    if (editFormData.type) setValue("type", editFormData.type)
  }, [editFormData.type, setValue])
  //
  useEffect(() => {
    setValue("required", editFormData.required)
  }, [editIndex, editFormData.required, setValue])

  const [requiredField, setRequiredField] = useState(false);


  const child = (
    <div>
      <h1 ref={form} id="main">
        Add elements to your form
      </h1>
      <div >
        <form onSubmit={handleSubmit(onSubmit)}>
          <HStack>
          <VStack>
            <HStack>
              <label>Question: </label>
              <Input
                autoComplete="off"
                defaultValue={editFormData.name}
                aria-label="name"
                aria-invalid={errors["name"] ? "true" : "false"}
                name="name"
                placeholder='describe your field'
                style={{
                  ...(errors["name"] ? errorStyle : null),
                }}
                {...register('name',{
                  required: true,
                  validate,
                })}
              />
            </HStack>
            <Flex>
              {errors.name && errors.name["type"] === "required" && (
                <p style={{color:'red'}}>This is required.</p>
              )}
              {errors.name && errors.name["type"] === "validate" && (
                <p style={{color:'red'}}>
                  Name required to be unique.
                </p>
              )}
            </Flex>
            <HStack>
              <label>Type: </label>
              <Select
                aria-label="Select type"
                name="type"
                defaultValue={editFormData.type}
                {...register('type')}
              >
                <option value="text">Text</option>
                <option value="select">Selector</option>
                <option value="checkbox">Checkbox</option>
                <option value="radio">Multiple choice</option>
                <option value="number">Number</option>
                <option value="textarea">Textarea</option>
                <option value="email">Email</option>
                <option value="range">Range</option>
                <option value="datetime">datetime</option>
                <option value="upload" disabled>datetime</option>
                <option value="text_field">text field (no question)</option>
                <option value="file_field" disabled>file field (no question)</option>
                <option value="video_field" disabled>video field (no question)</option>
                <option value="search" disabled>Search</option>
                <option value="tel" disabled>Tel</option>
                <option value="url" disabled>url</option>
                <option value="time" disabled>Time</option>
                <option value="datetime-local" disabled>datetime-local</option>
                <option value="week" disabled>week</option>
                <option value="month" disabled>month</option>
                <option value="validate" disabled>
                  validate
                </option>
              </Select>
            </HStack>

            {(type === "select" ||
              type === "radio" ||
              editFormData.type === "select" ||
              editFormData.type === "radio") && (
              <>
                <label>Options:</label>
                {/*
                  create a dinamic form to input the options



                  */}
                <Input
                  key={editFormData.name}
                  defaultValue={editFormData.options}
                  type="text"
                  name="options"
                  placeholder="Enter options separate by ;"
                  {...register('options')}
                />
              </>
            )}
          </VStack>
          <fieldset>
              {attr?
                <VStack>
              <Divider />
              <HStack>
              <label
                style={{
                  marginTop: 0,
                }}
              >
              Required
              </label>
                <input // cannot change it.. it doesnt respond
                  type="checkbox"
                  name="required"
                  label='Required'
                  isChecked={requiredField}
                  onChange={()=>setRequiredField(!requiredField)}
                  {...register('required')}
                  />
              </HStack>
              <HStack>
                <Text htmlFor="max">Max</Text>
                <Input
                  defaultValue={editFormData.max}
                  aria-label="max"
                  autoComplete="false"
                  name="max"
                  type="number"
                  {...register('max')}
                />
              </HStack>
              <HStack>
                <Text htmlFor="min">Min</Text>
                <Input
                defaultValue={editFormData.min}
                autoComplete="false"
                aria-label="min"
                name="min"
                type="number"
                {...register('min')}
              />
              </HStack>
              <HStack>
                <Text htmlFor="maxLength">MaxLength</Text>
                <Input
                defaultValue={editFormData.maxLength}
                autoComplete="false"
                aria-label="max length"
                name="maxLength"
                type="number"
                {...register('maxLength')}
                />
              </HStack>
              <HStack>
                <Text htmlFor="pattern">Pattern</Text>
                <Input
                autoComplete="false"
                defaultValue={editFormData.pattern}
                style={{
                  marginBottom: "20px",
                }}
                aria-label="pattern"
                name="pattern"
                type="text"
                {...register('pattern')}
                />
              </HStack>
              </VStack>
              :null}

            </fieldset>
          </HStack>
          <div style={{margin: '16px'}}>
            <Button
              onClick={()=>setAttr(!attr)}>Attributes</Button>

            <button
              style={{marginLeft:'40px' }}
              onClick={() => {
                form.current.scrollIntoView({ behavior: "smooth" })
              }}
            >
              {editIndex >= 0
                ? <EditIcon />
                : <AddIcon size='md' style={{color:'green'}}/>}
            </button>
          </div>
        </form>

        <section>
        <Divider />
          <div style={{margin:'16px'}}>
          {formData?
            <FormCreatorItem
            {...{
              editIndex,
              setEditIndex,
              formData,
              setFormData,
              reset
            }}
            />
            :null}
          </div>
        </section>
      </div>
    </div>
  )

  return (
        <VStack>
            {child}
        </VStack>
      )
}

export default React.memo(BuilderPage)
