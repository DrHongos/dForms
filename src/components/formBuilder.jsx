// copied from https://github.com/react-hook-form/documentation/blob/master/src/components/BuilderPage.tsx
//also check : https://github.com/dgonz64/react-hook-form-auto#readme

// Clean it up, copy the rest and make it work!
import * as React from "react"
import { Animate } from "react-simple-animate"
import { useForm } from "react-hook-form"
import { useStateMachine } from "little-state-machine"
import SortableContainer from "./sortables/sortableContainer"
import builder from "../data/builder"
import generic from "../data/generic"
import {Input, Select,  HStack, Text, Checkbox, Button} from '@chakra-ui/react';


const { useState, useRef, useEffect } = React

const updateStore = (state, payload) => {
  return {
    ...state,
    formData: [...payload],
  }
}

const errorStyle = {
  border: `1px solid black`,
  background: '#2f4f4f',
}

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

function BuilderPage({
  showBuilder,
  toggleBuilder,
  HomeRef,
  isStatic,
  defaultLang,
  newForm,
}) {
  const {
    state: { formData = [], language = {}},
    actions: { updateFormData },
  } = useStateMachine({ updateFormData: updateStore })
  const { currentLanguage } =
    language && language.currentLanguage
      ? language
      : { currentLanguage: defaultLang }
  const [editFormData, setFormData] = useState(defaultValue)
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
  const closeButton = useRef(null)
  const [showValidation, toggleValidation] = useState(false)
  const onSubmit = (data) => {
    if (editIndex >= 0) {
      formData[editIndex] = data
      updateFormData([...formData])
      setFormData(defaultValue)
      setEditIndex(-1)
    } else {
      updateFormData([...formData, ...[data]])
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

  useEffect(() => {
    if (showBuilder && closeButton.current) {
      closeButton.current.focus()
    }
  }, [showBuilder])

  useEffect(() => {
    setValue("toggle", shouldToggleOn)
  }, [shouldToggleOn, setValue])

  useEffect(() => {
    if (editFormData.type) setValue("type", editFormData.type)
  }, [editFormData.type, setValue])

  useEffect(() => {
    setValue("required", editFormData.required)
  }, [editIndex, editFormData.required, setValue])

  const [requiredField, setRequiredField] = useState(false);

  const child = (
    <div>
      <h1  id="main">
        {builder.builder[currentLanguage].title}
      </h1>
      <div >
        <section>
          <SortableContainer
            {...{
              updateFormData,
              formData,
              editIndex,
              setEditIndex,
              setFormData,
              editFormData,
              reset,
              currentLanguage,
            }}
          />
        </section>

        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 ref={form}>
            {builder.inputCreator[currentLanguage].title}
          </h2>

          <label>{generic.name[currentLanguage]}: </label>
          <Input
            autoComplete="off"
            defaultValue={editFormData.name}
            aria-label="name"
            aria-invalid={errors["name"] ? "true" : "false"}
            name="name"
            placeholder='name'
            style={{
              ...(errors["name"] ? errorStyle : null),
            }}
            {...register('name',{
              required: true,
              validate,
            })}
          />
          <Animate
            play={!!errors["name"]}
            duration={0.6}
            start={{
              maxHeight: 0,
            }}
            end={{ maxHeight: 20 }}
          >
            {errors.name && errors.name["type"] === "required" && (
              <p style={{color:'red'}}>This is required.</p>
            )}
            {errors.name && errors.name["type"] === "validate" && (
              <p style={{color:'red'}}>
                Name required to be unique.
              </p>
            )}
          </Animate>

          <label>{generic.type[currentLanguage]}: </label>
          <Select
            aria-label="Select type"
            name="type"
            defaultValue={editFormData.type}
            {...register('type')}
          >
            <option value="text">Text</option>
            <option value="select">Select</option>
            <option value="checkbox">Checkbox</option>
            <option value="radio">Radio</option>
            <option value="number">Number</option>
            <option value="textarea">Textarea</option>
            <option value="email">Email</option>
            <option value="range">Range</option>
            <option value="search">Search</option>
            <option value="tel">Tel</option>
            <option value="url">url</option>
            <option value="time">Time</option>
            <option value="datetime">datetime</option>
            <option value="datetime-local">datetime-local</option>
            <option value="week">week</option>
            <option value="month">month</option>
            <option value="validate" disabled>
              validate
            </option>
          </Select>

          {(type === "select" ||
            type === "radio" ||
            editFormData.type === "select" ||
            editFormData.type === "radio") && (
            <>
              <label>{builder.inputCreator[currentLanguage].options}:</label>
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

          <label>
            <Checkbox
              type="checkbox"
              name="toggle"
              isChecked={showValidation}
              {...register('toggle')}
              onChange={() => toggleValidation(!showValidation)}
            />
            {builder.inputCreator[currentLanguage].validation}
          </label>

          <Animate
            play={shouldToggleOn || showValidation}
            start={{
              maxHeight: 0,
              overflow: "hidden",
            }}
            end={{
              maxHeight: 800,
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            <fieldset>
              <label
                style={{
                  marginTop: 0,
                }}
              >
                <input // cannot change it.. it doesnt respond
                  type="checkbox"
                  name="required"
                  label='Required'
                  isChecked={requiredField}
                  onChange={()=>setRequiredField(!requiredField)}
                  {...register('required')}
                  />
                Required
              </label>
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

            </fieldset>
          </Animate>
          <button
            onClick={() => {
              form.current.scrollIntoView({ behavior: "smooth" })
            }}
          >
            {editIndex >= 0
              ? generic.update[currentLanguage]
              : generic.create[currentLanguage]}
          </button>
        </form>
      </div>
    </div>
  )

  if (isStatic) return child

  return (
    <Animate
      play={showBuilder || isStatic}
      easeType="ease-in"
      duration={0.5}
      start={{
        transform: "translateY(100vh)",
      }}
      end={{
        transform: "translateY(0)", // not so high!
      }}
      render={({ style }) => (
        <main  style={style}>
          <div
            id="builder"
            style={{
              overflow: "auto",
              height: "100vh",
              background: '#2f4f4f',
            }}
          >
            {child}
            <Button isDisabled={!formData} onClick={()=>newForm()}>Spread!</Button> {/*does not disable correctly*/}
          </div>
        </main>
      )}
    />
  )
}

export default React.memo(BuilderPage)
