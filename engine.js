const fs = require('node:fs/promises')
const { styleText } = require('node:util')
const { deflate } = require('node:zlib')
const zlib = require('zlib')
const readLine = require('readline')
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

function concatData(stream, offset, dataLength) {
  console.log(offset);
  console.log("dataLength", dataLength);

  // Allocate a buffer of the desired length
  const DataBuf = Buffer.alloc(dataLength);
  console.log("dataBuf Length", DataBuf.length)

  // Copy data from the stream into the buffer starting at the given offset
  const wow = stream.copy(DataBuf, 0, offset, offset + dataLength);
  console.log(wow)
  console.log(DataBuf[3773].toString(16))
  // Deflate the buffer using zlib
  zlib.inflate(DataBuf, (err, buf) => {
    if (err) {
      console.error("Error during deflation:", err);
    } else {
      console.log("in DEFLATE");
      const decimalArr = Array.from(buf).map(byte => byte.toString(10))
      // console.log(buf.toString('binary'));
      // console.log(decimalArr)
      for (let i = 0; i < decimalArr.length; i++) {
        if (decimalArr[i] === 0) {
          console.log(decimalArr[i])
        }
      }
    }
  });
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
    console.log('IDAT CHUNK TYPE')

    // for (let i = offset; i < dataLength + chunkLayout + offset; i++) {
    //   console.log(stream[i].toString(16).padStart(2, '0'))
    // }
    concatData(stream, offset + 8, dataLength)
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

    //readLine.emitKeypressEvents(process.stdin)
    ////if (process.stdin.isTTY) {
    // process.stdin.setRawMode(true)
    // }

    //process.on('keypress', (str, key) => {
    //  console.log(str, key)
    //})
    // calculate the lenght of the IHDR
    //  for (let i = currentOffset; i <= currentOffset + chunkLength - 1; i++) {
    //    console.log(`byte: ${i}`, stream[i].toString(16).padStart(2, '0'))
    //    //   console.log(`byte: ${i}`, stream[i].toString(10).padStart(2, '0'))
    //    decimal = decimal << 8 | stream[i]
    //    dataLength += Number(stream[i].toString(10))
    while (currentOffset !== -1) {
      currentOffset = calcNextOffset(stream, currentOffset, chunkLength, chunkLayout)
    }
    //}
    //currentOffset = calcNextOffset(stream, currentOffset, chunkLength, chunkLayout)
    //currentOffset = calcNextOffset(stream, currentOffset, chunkLength, chunkLayout)
    // calculate the length of IDAT
    //    for (let i = doOffset; i < doOffset + chunkLength; i++) {
    //     //    console.log(`byte: ${i}`, stream[i].toString(10).padStart(2, '0'))
    //   console.log(`byte: ${i}`, stream[i].toString(16).padStart(2, '0'))
    //  decimal = decimal << 8 | stream[i]
    //  dataLength += Number(stream[i].toString(10))
    // }
    //    console.log(decimal)
    //currentOffset = calcNextOffset(stream, currentOffset, chunkLength, chunkLayout)
    console.log(currentOffset)
  } catch (error) {
    console.log(error)
  }

}

main()
