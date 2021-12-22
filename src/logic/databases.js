import toast from "react-hot-toast";
export const getDB = async (orbitdb, address) => {
  let db
  if (orbitdb) {
    db = await orbitdb.open(address)
    await db.load()
    db.events.on('replicated', () => {
      console.log('replicated',db)
      let result;
      try{
        result = db.iterator({ limit: -1 }).collect().map(e => e.payload.value) // gives an error
      }catch{
        result = db.all
        console.log()
      }
      console.log(result.join('\n'))
    })
  }
  return db
}

export const getFormData = async (ipfsNode, cid) =>{
  console.log('Retrieving ',cid)
  for await (const result of ipfsNode.cat(cid.toString())) {
    return result
  }
}

export const addSupport = async(myForms, type, formObject, formCid)=>{
  // let type='keyvalue' // forced! but ... should be keyValue
  myForms.add({
    name:formObject.name,
    type,
    dbAddress:formCid,
    description: formObject.description,
    responses: formObject.responses,
    supporters:formObject.supporters,
    added: Date.now()
  })
  // add orbitdb Id to supportersDB!
  toast.success('Form is now supported!')
}

export const isSupported = async (id, myForms) => {
    if(myForms && myForms.length > 0){
      let myFormsIds = myForms.map(x=>{return (x.payload.value.responses)})
      // console.log(id,' is in ',myFormsIds,'?',myFormsIds.includes(id))
      return myFormsIds.includes(id)
    }
    return false;
  }
