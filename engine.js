const fs = require('node:fs/promises')
const { styleText } = require('node:util')
const { deflate } = require('node:zlib')
const zlib = require('zlib')

const hexMap = {
  a: 10,
  b: 11,
  c: 12,
  d: 13,
  e: 14,
  f: 15,
}
function readChunkType(stream, offset, chunkLength) {
  let typeString = ""
  for (let i = offset + 4; i < offset + 8; i++) {
    typeString += String.fromCharCode(stream[i])
    //    console.log(String.fromCharCode(stream[i]))
  }
  return typeString
}

function concatData(stream) {

}

function calcNextOffset(stream, offset, chunkLength, chunkLayout) {
  console.log("offset:", offset)
  console.log("chunkLayout:", chunkLayout)
  let dataLength = 0
  for (let i = offset; i <= offset + chunkLength - 1; i++) {
    //    console.log(`byte: ${i}`, stream[i].toString(16).padStart(2, '0'))
    dataLength = dataLength << 8 | stream[i]
  }

  console.log("length of chunk Data: ", dataLength)
  const chunkType = readChunkType(stream, offset, chunkLength)
  console.log(chunkType)
  // readData(stream)

  if (chunkType === 'IDAT') {
    console.log('------------------------------------------------------')
    return dataLength + chunkLayout + offset
  } else if (chunkType !== 'IEND') {
    console.log('------------------------------------------------------')
    return dataLength + chunkLayout + offset
  } else {
    return -1
  }
}


async function main() {
  try {
    const stream = await fs.readFile('./frame.png')
    //console.log(stream[33].toString(16).padStart(2, '0'))
    let chunkLength = 4
    let currentOffset = 8
    let dataLength = 12
    let decimal = 0
    let chunkLayout = 12

    // calculate the lenght of the IHDR
    //  for (let i = currentOffset; i <= currentOffset + chunkLength - 1; i++) {
    //    console.log(`byte: ${i}`, stream[i].toString(16).padStart(2, '0'))
    //    //   console.log(`byte: ${i}`, stream[i].toString(10).padStart(2, '0'))
    //    decimal = decimal << 8 | stream[i]
    //    dataLength += Number(stream[i].toString(10))

    //}
    currentOffset = calcNextOffset(stream, currentOffset, chunkLength, chunkLayout)
    console.log("next current offset: ", currentOffset)
    currentOffset = calcNextOffset(stream, currentOffset, chunkLength, chunkLayout)
    // calculate the length of IDAT
    //    for (let i = doOffset; i < doOffset + chunkLength; i++) {
    //     //    console.log(`byte: ${i}`, stream[i].toString(10).padStart(2, '0'))
    //   console.log(`byte: ${i}`, stream[i].toString(16).padStart(2, '0'))
    //  decimal = decimal << 8 | stream[i]
    //  dataLength += Number(stream[i].toString(10))
    // }
    //    console.log(decimal)
    currentOffset = calcNextOffset(stream, currentOffset, chunkLength, chunkLayout)
    console.log(currentOffset)
  } catch (error) {
    console.log(error)
  }
}

main()
