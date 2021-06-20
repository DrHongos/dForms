import * as React from 'react';
import IPFS from 'ipfs'
import Config from './config'
import OrbitDB from 'orbit-db'

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
  const [forms, setForms] = React.useState();
  const [entries, setEntries] = React.useState();
  const initOrbitDB = async (ipfs) => {
    orbitdb = await OrbitDB.createInstance(ipfs, {repo:'./orbitDBForms'})
    // console.log('OrbitDB connected!',orbitdb)
    setOrbit(orbitdb)
    if(orbitdb){
      getAllDatabases(orbitdb)
    }else{
      console.log('error on orbit db instance generation')
    }
    return orbitdb
  }

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
    entries = await myForms.iterator({ limit: 10 }).collect().reverse()
  }else{
    entries = []
  }
  setEntries(entries)
  setForms(arrayMyForms)
  return arrayMyForms;
}


  React.useEffect(() => {
    const initIPFS = async () => {
        ipfs = await IPFS.create(Config.ipfs)
        // console.log('IPFS connected!',ipfs)
        setIpfsNode(ipfs)
        return ipfs;
      }

    setLoading(true) //does not work!
    initIPFS().then(node=>{initOrbitDB(node)})
    setLoading(false)

    }, []);

  return <SystemsContext.Provider value={[ipfsNode, orbit, loading, myForms, entries]}>{children}</SystemsContext.Provider>
}
