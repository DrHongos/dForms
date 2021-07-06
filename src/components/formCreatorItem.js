import * as React from "react"
import {VStack,Button,IconButton,HStack, Text } from '@chakra-ui/react';
import {ArrowRightIcon, EditIcon, DeleteIcon, CloseIcon} from '@chakra-ui/icons';
// updateFormData,
// formData,
// editIndex,
// setEditIndex,
// setFormData,
// reset,
export default function FormCreatorItem({
  editIndex,
  setEditIndex,
  formData,
  setFormData,
  reset
}) {
  return (
    <VStack>
      {formData.map((field, index) => {
          return (
            <li  key={field.name} data-id={field.name}>
              <HStack>
              <ArrowRightIcon />
              <Text>{field.name}</Text>
                    <button
                      style={{
                        ...(editIndex === index
                          ? { background: 'darkgreen' }
                          : null),
                      }}
                      onClick={() => {
                        console.log('editIndex',editIndex)
                        console.log('index',index)
                        if (editIndex === index) {
                          setEditIndex(-1)
                          // setFormData({})
                          reset()
                        } else {
                          const index = formData.findIndex(
                            (data) => field.name === data.name
                          )
                            // setFormItemData(formData[index])
                          setEditIndex(index)
                        }
                      }}
                    >
                      {editIndex === index
                        ? <CloseIcon />
                        : <EditIcon />}
                    </button>
                    <IconButton
                      onClick={() => {
                        console.log('index, ',editIndex)
                        if (
                          window.confirm(
                            "Are you sure you want to delete this?"
                          )
                        ) {
                          const index = formData.findIndex(
                            (data) => field.name === data.name
                          )

                          if (index >= 0) {
                            setFormData([
                              ...formData.slice(0, index),
                              ...formData.slice(index + 1),
                            ])
                            setEditIndex(-1)

                            if (editIndex === index) {
                              // setFormData({})
                              console.log('setformdata???')
                            }
                          }
                        }
                      }}
                      icon={<DeleteIcon />}
                    >
                    </IconButton>
                  </HStack>
                </li>
              )}
          )
        }

      {(formData || []).length > 0 && (
        <div>
          <Button
            onClick={() => {
              if (
                window.confirm("Are you sure you want to delete all fields?")
              ) {
                setFormData([])
                console.log('updateFormData')
              }
            }}
            style={{
              marginRight: 15,
            }}
          >
            Delete all
          </Button>
        </div>
      )}
    </VStack>
  )
}
