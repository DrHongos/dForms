import * as React from 'react';
import IPFS from 'ipfs';
import Config from './config';
import OrbitDB from 'orbit-db';
import POHController from './libs/acl_poh';
import toast from "react-hot-toast";

let AccessControllers = require('orbit-db-access-controllers');
AccessControllers.addAccessController({ AccessController: POHController })
// instances
let orbitdb
let ipfs
let myForms

const SystemsContext = React.createContext()
export const useSystemsContext = () => React.useContext(SystemsContext);

export const SystemsProvider = ({children}) => {
  const [ipfsNode, setIpfsNode] = React.useState();
  const [orbit, setOrbit] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [entries, setEntries] = React.useState();
  const [peers, setPeers] = React.useState();
  var peerCount = 0; 	// this is kind of a janky way to track peer count. really it'd be better to store the peers

  // const prefix = "dForms-";
  // let lastAlive = 0;	// last keep-alive we saw from a relay
  // let lastPeer = 0; 	// last keep-alive we saw from another peer
  // let lastBootstrap = 0; // used for tracking when we last attempted to bootstrap (likely to reconnect to a relay)

  const getAllDatabases = async (orbitdb) => {
      if (!myForms) {
        // Load programs database
        myForms = await orbitdb.feed('browser.forms', {
          accessController: { write: [orbitdb.identity.id] },
          create: true
        })
        await myForms.load()
      }
      let arrayMyForms = myForms
        ? myForms.iterator({ limit: -1 }).collect()
        : []
      let entries
      if(myForms){
        entries = await myForms.iterator({ limit: 100 }).collect().reverse()
      }else{
        entries = []
      }
      setEntries(entries)
      return arrayMyForms;
  }

  // // let lastBootstrap = 0;
  // // if reconnect is true, it'll first attempt to disconnect from the bootstrap nodes
	// async function dobootstrap(reconnect) {
	// 	let now = new Date().getTime();
	// 	if (now-lastBootstrap < 60000) { // don't try to bootstrap again if we just tried within the last 60 seconds
	// 		return;
	// 	}
	// 	lastBootstrap = now;
  //   const bootstraps = Config.ipfs.config.Addresses.Swarm;
	// 	for (let i in bootstraps) {
  //     console.log('bootstraping', i);
	// 		if (reconnect) {
	// 			try {
	// 				await ipfs.swarm.disconnect(bootstraps[i]);
	// 			} catch (e) {
	// 				console.log(e);
	// 			}
	// 		} else {
	// 			await ipfs.bootstrap.add(bootstraps[i]);
	// 		}
	// 		await ipfs.swarm.connect(bootstraps[i]);
	// 	}
	// }


  const initOrbitDB = async (ipfs) => {
    orbitdb = await OrbitDB.createInstance(ipfs, {
      repo:'./orbitDBForms',
      AccessControllers: AccessControllers});
    // console.log('OrbitDB connected!',orbitdb)
    toast.success('OrbitDB loaded')
    setOrbit(orbitdb)
    if(orbitdb){
      getAllDatabases(orbitdb)
    }else{
      toast.error('error on orbit db instance generation')
    }
    setLoading(false)
    return orbitdb
  }

  const getPeers = async () =>{
    let peerList = await ipfs.swarm.peers();
    // console.log('checking',peerList)
    setPeers(peerList);
  }
  // // out is used for processing recieved messages and outputting them both to console and the message box.
  // function out(msg) {
  //   msg = new TextDecoder().decode(msg.data);
  //   console.log('outs',msg);
  //   // c = document.getElementById("chat");
  //   // c.innerHTML += "<br>"+msg.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  //   // c.scrollTop = c.scrollHeight;
  // }

  // // usage: await joinchan("example_channel");
  // async function joinchan(chan) {
  //   await ipfs.pubsub.subscribe(prefix+chan, out);
  // }
  // // usage: await sendmsg("Hello", "example_channel");
  // async function sendmsg(msg, chan) {
  //   await ipfs.pubsub.publish(prefix+chan, msg);
  // }
  // // used for triggering a sendmsg from user input
  // async function sendMsg() {
  //   let displayn = document.getElementById("displayInput").value;
  //   let msg = document.getElementById("chatInput").value;
  //   if (displayn == "" || msg == "") {
  //     return true;
  //   }
  //   sendmsg("["+displayn+"] " + msg, "global");
  //   document.getElementById("chatInput").value = "";
  // }
  // // check if we're still connected to the circuit relay (not required, but let's us know if we can see peers who may be stuck behind NAT)
  // function checkalive() {
  //   let now = new Date().getTime();
  //   if (now-lastAlive >= 35000) {
  //     if (now-lastPeer >= 35000) {
  //       document.getElementById("status-ball").style.color = "red";
  //     } else {
  //       document.getElementById("status-ball").style.color = "yellow";
  //     }
  //     dobootstrap(true); // sometimes we appear to be connected to the bootstrap nodes, but we're not, so let's try to reconnect
  //   } else {
  //     document.getElementById("status-ball").style.color = "lime";
  //   }
  // }

  // // processes a circuit-relay announce over pubsub
	// async function processAnnounce(addr) {
	// 	// get our peerid
	// 	let me = await ipfs.id();
	// 	me = me.id;
  //
	// 	// not really an announcement if it's from us
	// 	if (addr.from == me) {
	// 		return;
	// 	}
  //
	// 	// process the recieved address
	// 	addr = new TextDecoder().decode(addr.data);
  //
	// 	if (addr == "peer-alive") {
	// 		console.log(addr);
	// 		let pcDisplay = document.getElementById("peerCount");
	// 		peerCount += 1;
	// 		pcDisplay.innerHTML = peerCount.toString();
	// 		setTimeout(function(){
	// 			peerCount -= 1;
	// 			pcDisplay.innerHTML = peerCount.toString();
	// 		}, 15000);
  //
	// 		lastPeer = new Date().getTime();
	// 		return;
	// 	}

		// // keep-alives are also sent over here, so let's update that global first
		// lastAlive = new Date().getTime();
    //
    //
		// if (addr == "keep-alive") {
		// 	console.log(addr);
		// 	return;
		// }
		// let peer = addr.split("/")[9];
		// console.log("Peer: " + peer);
		// console.log("Me: " + me);
		// if (peer == me) {
		// 	return;
		// }
    //
		// // get a list of peers
		// peers = await ipfs.swarm.peers();
		// for (let i in peers) {
		// 	// if we're already connected to the peer, don't bother doing a circuit connection
		// 	if (peers[i].peer == peer) {
		// 		return;
		// 	}
		// }
		// // log the address to console as we're about to attempt a connection
		// console.log(addr);

		// // connection almost always fails the first time, but almost always succeeds the second time, so we do this:
		// try {
		// 	await ipfs.swarm.connect(addr);
		// } catch(err) {
		// 	console.log(err);
		// 	await ipfs.swarm.connect(addr);
		// }
	// }

  React.useEffect(() => {
    const initIPFS = async () => {
        setLoading(true) //does not work!
        ipfs = await IPFS.create(Config.ipfs)
        // console.log('IPFS connected!',ipfs)
        toast.success('IPFS connected');
        setIpfsNode(ipfs)

        // new stuff
  			// await dobootstrap(false); // does not have a valid peer type
        getPeers();
        // joinchan('global');
        // // publish and subscribe to keepalive to help keep the sockets open
        // await ipfs.pubsub.subscribe(prefix+"keepalive");
        // setInterval(function(){sendmsg("1", prefix+"keepalive");}, 4000);
        // setInterval(checkalive, 1000);
  			// // process announcements over the relay network, and publish our own keep-alives to keep the channel alive
  			// await ipfs.pubsub.subscribe("announce-circuit", processAnnounce);
  			// setInterval(function(){ipfs.pubsub.publish("announce-circuit", "peer-alive");}, 15000);

  			// // block for translating an enter keypress while in the chat input as a message submission
  			// document.getElementById("chatInput").addEventListener("keydown", async function(e) {
  			// 	if (!e) { var e = window.event; }
        //
  			// 	// Enter is pressed
  			// 	if (e.keyCode == 13) {
  			// 		e.preventDefault();
  			// 		await sendMsg();
  			// 	}
  			// }, false);

        return ipfs;
      }

    initIPFS().then(node=>{initOrbitDB(node)})
    //
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <SystemsContext.Provider value={[ipfsNode, orbit, loading, myForms, entries, peers]}>{children}</SystemsContext.Provider>
}
