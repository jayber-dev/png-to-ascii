const fs = require('fs');
const zlib = require('zlib');

async function main() {
  try {
    const stream = await fs.promises.readFile('./frame.png');
    let currentOffset = 8; // Start after the PNG signature
    const chunkLength = 4;
    const chunkLayout = 12; // 4 bytes length + 4 bytes type + 4 bytes CRC

    while (currentOffset !== -1) {
      currentOffset = calcNextOffset(stream, currentOffset, chunkLength, chunkLayout);
    }
  } catch (err) {
    console.error('Error reading file:', err);
  }
}

function calcNextOffset(stream, offset, chunkLength, chunkLayout) {
  console.log("offset:", offset);
  let dataLength = 0;

  for (let i = offset; i < offset + chunkLength; i++) {
    dataLength = (dataLength << 8) | stream[i];
  }

  console.log("length of chunk Data: ", dataLength);
  const chunkType = readChunkType(stream, offset, chunkLength);
  console.log(chunkType);

  if (chunkType === 'IDAT') {
    console.log('IDAT CHUNK TYPE');
    concatData(stream, offset + 8, dataLength); // offset + 8 to skip length and type
    console.log('------------------------------------------------------');
    return dataLength + chunkLayout + offset;
  } else if (chunkType !== 'IEND') {
    console.log('------------------------------------------------------');
    return dataLength + chunkLayout + offset;
  } else {
    return -1; // End of file
  }
}

function readChunkType(stream, offset, chunkLength) {
  let typeString = "";
  for (let i = offset + chunkLength; i < offset + chunkLength + 4; i++) {
    typeString += String.fromCharCode(stream[i]);
  }
  return typeString;
}

function concatData(stream, offset, dataLength) {
  console.log("offset:", offset);
  console.log("dataLength", dataLength);

  const DataBuf = Buffer.alloc(dataLength);
  console.log("dataBuf Length", DataBuf.length);

  stream.copy(DataBuf, 0, offset, offset + dataLength);

  zlib.inflate(DataBuf, (err, buf) => {
    if (err) {
      console.error("Error during inflation:", err);
    } else {
      console.log("in DEFLATE");
      const decimalArr = Array.from(buf).map(byte => byte.toString(10));
      console.log(decimalArr);
    }
  });
}

main();
