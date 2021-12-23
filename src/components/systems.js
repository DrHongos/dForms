import React, {useState, useEffect} from 'react'
import { Spinner, HStack, VStack, Box, Text, Button, IconButton } from "@chakra-ui/react"
import { CheckCircleIcon, InfoIcon, CopyIcon} from '@chakra-ui/icons'
import {useWeb3Context} from '../contexts/Web3Context';
import {useSystemsContext} from '../contexts/systems';
import toast from "react-hot-toast";
import copyClipBoard from "../logic/copyClipBoard"

function Systems () {
  const { account, loading, connectWeb3,disconnectWeb3} = useWeb3Context();
  const  [ ipfs, orbit, loadingIPFS, ,] = useSystemsContext();
  const [ipfsId, setIpfsId] = useState();
  const shortedId = (data)=>{return data.slice(0,4)+'..'+data.slice(-4,)}

  // add ipfs id
  useEffect(() => {
    async function getId(){
      let getIpfsId = await ipfs.id()
      setIpfsId(getIpfsId.id)
    }
    if(ipfs){
      getId();
    }
  },[ipfs])
  // add the copy button

  const SystemElement = (props)=> (
      <HStack fontSize='sm' spacing={1} fontWeight='semibold'>
        <Text>{props.name}</Text>{''}
        {props.isLoading?
          <Spinner />
          :
          <CheckCircleIcon style={{color:'green'}}/>
        }
        {props.data?
          <Text>
          {props.data.length > 20 ? shortedId(props.data) :props.data}
          </Text>
        :null}
        <IconButton
          onClick={()=>copyClipBoard(props.data)}
          aria-label="Copy"
          icon={<CopyIcon />} />
        <IconButton
          onClick={()=>getData(props.name)}
          aria-label="Copy"
          icon={<InfoIcon />} />
      </HStack>
  )

  function getData(about){
    let title;
    let content;
    switch (about) {
      case 'IPFS':
        title = 'IPFS'
        content = 'A descentralization tool for storage'
        break;
      case 'OrbitDB':
        title = 'OrbitDB'
        content = 'A descentralization database tool'
        break;
      case 'Web3':
        title = 'Web3'
        content = 'A descentralized account'
        break;
      default:
        title = 'dForms'
        content = 'A tool for descentralized forms'
    }
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div style={{backgroundColor:'white', color: 'black'}}>
          <div>
            <div>
              <p>
                Information about: {title}
              </p>
              <p>
                {content}
              </p>
            </div>
          </div>
        </div>
        <div>
          <button
            onClick={() => toast.dismiss(t.id)}
          >
            Close
          </button>
        </div>
      </div>
    ))
  }

  return (
    <Box  border='1px solid lightgray'>
      <VStack  alignItems='left'>
          <SystemElement
            name = 'IPFS'
            isLoading = {loadingIPFS}
            data = {ipfsId?ipfsId:'loading'}
            />
          <SystemElement
            name = 'OrbitDB'
            isLoading = {loadingIPFS}
            data = {orbit?orbit.identity._id:'loading'}
            />
          {!account?
            <Button onClick={()=>connectWeb3()}>Connect wallet</Button>
            :
            <>
              <SystemElement
              name = 'Web3'
              isLoading = {loading}
              data = {account?account:'connect'}
              />
              <Button onClick={()=>disconnectWeb3()}>Disconnect web3</Button>
            </>
          }
          {/*providerChainId !== 100? 'Connect to xdai' : account*/}

      </VStack>
    </Box>
  )
}

export default Systems
