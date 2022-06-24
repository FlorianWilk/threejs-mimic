




const floorMesh=loadMesh("floor")
const locationObject=getLocationObject()
const anchorPoints=getDistributedPoints(floorMesh)

anchorPoints.forEach(ap=>{
    ap.length=getDistance(locationObject,ap)
})

