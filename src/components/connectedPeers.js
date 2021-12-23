import React, {useState, useEffect} from "react";
import { Text, HStack,VStack, Button, Input} from "@chakra-ui/react"
import {useSystemsContext} from '../contexts/systems';
// import {getDB} from '../../libs/databaseLib';

function ConnectedPeers(props) {
  const  [ipfsNode, , , , ] = useSystemsContext();
  const [peers, setPeers] = useState();
  const [addPeer, setAddPeer] = useState(false);
  const [peerToFetch,setPeerToFetch]= useState();

  async function getPeersConnected() {
    let peers = await ipfsNode.swarm.peers()
    setPeers(peers);
    return peers;
  }
  useEffect(() => {
    if(ipfsNode){
      window.setInterval(()=>getPeersConnected(), 300); // not working!
    }
  },[ipfsNode]);

  async function searchForPeer(){
    if(!peerToFetch){
      return
    }
    console.log('searching',peerToFetch)
    // validate the data in peerToFetch ['/p2p-circuit/ipfs/'+...]
    await ipfsNode.swarm.connect('/ip4/7.7.7.7/tcp/4242/p2p-circuit/p2p/'+peerToFetch)
    // let current = await getPeersConnected();
    // console.log('current',current)
    // let dataFound = current.find(x=>x.peer == peerToFetch);
    // if(dataFound){
    //   await addPeerToPeersStore(dataFound);
    // }
      // console.log('/p2p-circuit/ipfs/'+peerToFetch,' connected!', found)
  }

  return (
    <VStack border='1px solid lightgray'>
      <Text>Connected peers:</Text>
      <Text>{peers?.length}</Text>
      <HStack>
        <Button onClick={()=>setAddPeer(!addPeer)}>add peer</Button>
      </HStack>
      {addPeer?
        <HStack>
          <Input onChange={(e)=>setPeerToFetch(e.target.value)} placeholder='enter peer Id'></Input>
          <Button onClick={()=>searchForPeer()}>search</Button>
        </HStack>
        :null}
    </VStack>

  );
}
export default ConnectedPeers;
