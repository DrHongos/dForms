// modify this to create Chakra-UI form type!
// check why input does not get required
export default (formData, isV7) => {
  return `import React from 'react';
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
  HStack
} from "@chakra-ui/react";
export default function App() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = data => console.log(data);
  console.log(errors);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack>
${
  Array.isArray(formData)
    ? formData.reduce(
        (
          previous,
          {
            type,
            name,
            required,
            max,
            min,
            maxLength,
            minLength,
            pattern,
            options,
          }
        ) => {
          const anyAttribute = [
            required,
            max,
            min,
            maxLength,
            minLength,
            pattern,
          ].some(value => {
            const isBooleanValue = typeof value === 'boolean';

            if (isBooleanValue) {
              return value !== undefined;
            }

            return Boolean(value);
          })
          const wrapForm = (child) => {return (`
            <FormControl>
              ${child}
            </FormControl>
            <Divider />
            `)}

          const ref = isV7
            ? `{...register${
                required ? `("${name}", { required: true })` : ""
              }}`
            : ` ref={register${required ? "({ required: true })" : ""}}`

          if (type === "select") {
            const select = `
                  <Text>${name}</Text>
                  <Select ${
              isV7 ? "" : `name="${name}"`
            }${ref}>\n${options
              .split(";")
              .filter(Boolean)
              .reduce((temp, option) => {
                return (
                  temp +
                  `        <option value="${option}">${option}</option>\n`
                )
              }, "")}      </Select>\n`

            return previous + wrapForm(select)
          }

          if (type === "radio") {
            const select = `\n${options
              .split(";")
              .filter(Boolean)
              .reduce((temp, option) => {
                return (
                  temp + // children should change name.. otherwise wont work
                  `
          <HStack>
            <Text>${option}</Text>
            <Radio ${
              isV7 ? "" : `name="${name}.${option}`
            }${ref} type="${type}" value="${option}" />\n
          </HStack>
                  `
                )
              }, "")}`
            const selectWrapped =`
    <RadioGroup>
      <VStack>
      <Text>${name}</Text>
          ${select}
      </VStack>
    </RadioGroup>\n
            `

            return previous + wrapForm(selectWrapped)
          }

          let attributes = ""

          if (anyAttribute) {
            attributes += isV7 ? `("${name}", {` : "({"

            if (required) {
              attributes += "required: true"
            }
            if (max) {
              attributes += `${attributes === "({" ? "" : ", "}max: ${max}`
            }
            if (min) {
              attributes += `${attributes === "({" ? "" : ", "}min: ${min}`
            }
            if (minLength) {
              attributes += `${
                attributes === "({" ? "" : ", "
              }minLength: ${minLength}`
            }
            if (maxLength) {
              attributes += `${
                attributes === "({" ? "" : ", "
              }maxLength: ${maxLength}`
            }
            if (pattern) {
              attributes += `${
                attributes === "({" ? "" : ", "
              }pattern: /${pattern}/i`
            }

            attributes += "})"
          }



          const register = isV7
          ? `{...register${attributes}}`
          : `name="${name}" ref={register${attributes}`

          if (type === "checkbox") {
            const select = `<Text>${name}</Text>      <Checkbox ${register}/>\n`
            return previous + wrapForm(select)
          }


          if (type === "textarea") {
            const select = `      <textarea placeholder="${name}" ${register}/>\n`
            return previous + wrapForm(select)
          }

          return (
            previous +wrapForm(
            `      <input type="${type}" placeholder="${name}" ${register} />\n`)
          )
        },
        ""
      )
    : ""
}
      <Button type="submit" />
      </VStack>
    </form>
  );
}`
}
