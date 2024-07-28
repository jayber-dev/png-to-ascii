const fs = require('node:fs/promises')
const { styleText } = require('node:util')
const { deflate, inflate } = require('node:zlib')
const zlib = require('zlib')
const readLine = require('readline')



function readChunkType(stream, offset, chunkLength) {
  let typeString = ""
  for (let i = offset + 4; i < offset + 8; i++) {
    typeString += String.fromCharCode(stream[i])
    //    console.log(String.fromCharCode(stream[i]))
  }
  return typeString
}

function readIHDR(stream, dataLength, chunkLayout, offset) {
  console.log("readIHDR")
  console.log("CHUNK LAYOUT:", chunkLayout)
  console.log("DATA LENGTH:", dataLength)
  // console.log(stream.toString().padStart(0,'0'))
  console.log(stream[offset].toString().padStart(2, '0'))
  // console.log(stream)
  for (let i = offset; i < offset + dataLength; i++) {
    console.log(stream[i].toString("16").padStart(2, '0'))

  }


}

function concatData(stream, offset, dataLength) {
  console.log("---------------------- concatData ------------------")
  console.log("OFFSET", offset);
  console.log("dataLength", dataLength);

  const DataBuf = Buffer.alloc(dataLength);
  console.log("dataBuf Length", DataBuf.length)

  const wow = stream.copy(DataBuf, 0, offset, offset + dataLength);
  console.log(wow)
  // console.log(DataBuf[3773].toString(16))
  zlib.inflate(DataBuf, (err, buf) => {
    if (err) {
      console.error("Error during deflation:", err);
    } else {
      console.log("in INFLATE");
      const decimalArr = Array.from(buf).map(byte => byte.toString(10))
      // console.log(buf.toString('binary'));
      console.log(decimalArr)
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
  // console.log("chunkLayout:", chunkLayout)
  let dataLength = 0
  for (let i = offset; i <= offset + chunkLength - 1; i++) {
    dataLength = dataLength << 8 | stream[i]
  }

  console.log("length of chunk Data: ", dataLength)
  const chunkType = readChunkType(stream, offset, chunkLength)
  console.log(chunkType)
  if (chunkType === 'IHDR') {
    readIHDR(stream, dataLength, chunkLayout, offset)
  }

  if (chunkType === 'IDAT') {
    console.log('IDAT CHUNK TYPE')

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
    const stream = await fs.readFile('./frameMini.png')
    //console.log(stream[33].toString(16).padStart(2, '0'))
    let chunkLength = 4
    let currentOffset = 8
    // let dataLength = 12
    // let decimal = 0

    // Each ChunkLayout consisit of four parts:
    // 1. LENGTH OF DATA FIELD 4 BYTE unsigned integer
    // 2. Chunk Type a 4 BYTE read as ascii
    // 3. Chunk DATA can be 0 length up to ~
    // 4. CRC 4 BYTES - not included in Length  
    let chunkLayout = 12
    // console.log(stream.toString().padStart(0,'0'))
    while (currentOffset !== -1) {
      currentOffset = calcNextOffset(stream, currentOffset, chunkLength, chunkLayout)
    }

    console.log(currentOffset)
  } catch (error) {
    console.log(error)
  }

}

main()
