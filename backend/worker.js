const { parentPort, workerData } = require('worker_threads');

const processChunk = (chunk) => {
  const regCodeMap = new Map();
  const filtered = [];
  const eliminated = [];

  chunk.forEach((row) => {
    const regCode = row['Reg Code'];
    if (!regCode) return;

    const score = Object.values(row).filter((value) => value !== '').length;

    if (!regCodeMap.has(regCode)) {
      regCodeMap.set(regCode, { row, score });
    } else {
      const existing = regCodeMap.get(regCode);
      if (score > existing.score) {
        eliminated.push(existing.row);
        regCodeMap.set(regCode, { row, score });
      } else {
        eliminated.push(row);
      }
    }
  });

  return {
    filtered: Array.from(regCodeMap.values()).map((r) => r.row),
    eliminated,
  };
};

// Process the chunk and send results back
parentPort.postMessage(processChunk(workerData.chunk));