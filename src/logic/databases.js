export const getDB = async (orbitdb, address) => {
  let db
  if (orbitdb) {
    db = await orbitdb.open(address)
    await db.load()
    db.events.on('replicated', () => {
      console.log('replicated',db)
      const result = db.iterator({ limit: -1 }).collect().map(e => e.payload.value) // gives an error
      console.log(result.join('\n'))
    })
  }
  return db
}
