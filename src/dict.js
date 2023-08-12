const chunkLen = 2;

export default async () => {
  const file = await fetch("/dict/words.txt");
  const text = await file.text();
  const entries = filterMap(text.split('\n'), toEntry);
  const chunkIndex = new Map;
  for (const entry of entries) {
    const chunks = entry.chunks;
    delete entry.chunks;
    for (const chunk of chunks) {
      const indexEntry = chunkIndex.get(chunk) || [];
      indexEntry.push(entry);
      chunkIndex.set(chunk, indexEntry);
    }
  }
  return { entries, chunkIndex, filterFit };
}

// ["", "AB", "", "CD"] <- gridChunks
//             ^ pivotIndex
function filterFit(gridChunks, pivotIndex) {
  // pivotIndex is relative to gridChunks
  // anchorIdx is relative to gridChunks
  // wordIdx is relative to wordChunks

  // TODO: `gridFills` is sucks.
  // we want a Set<(String, usize)>,
  // but js makes this hell.
  // (usize => idx into `grid`)
  let gridFills = [];
  let pivotFills = new Set;

  // `anchor` is the real-ass text closest to our pivot point.
  //   we use this to lookup potential words.
  // `pivot` is our focal cell. It's probably empty, but it _must_
  //   but included within the suggested word.
  const fitEm = anchorIdx => {
    let anchor = gridChunks[anchorIdx];
    let words = this.chunkIndex.get(anchor) || [];
    for (const entry of words) {
      const wordChunks = chunked(entry.word);
      for (const [wordIdx, chunk] of wordChunks.entries()) {
        if (chunk == anchor) {  // try anchoring here
          // word       ["AB", "CD", "EF", "GH"]
          // grid [ "" ,  "" , "CD",  "" ,  "" ]
          //             anchor ^      ^ pivot
          // anchorIdx = 2
          //   wordIdx = 1

          // these are the indexes in `gridChunks` that delimit
          // where `word` would be placed.
          const gridStart = anchorIdx - wordIdx;
          const gridEnd = gridStart + wordChunks.length;

          const wordPivotIdx = pivotIndex - gridStart;
          // we wanna include the pivot pt in the words we're lookin for.
          // that's... the whole point.
          if (wordPivotIdx < 0 || wordPivotIdx >= wordChunks.length) continue;
          const pivot = wordChunks[wordPivotIdx];

          if (gridStart < 0) continue; // `word` starts too early
          // bad boundary: can't place the bookending wall
          if (gridStart > 0 && gridChunks[gridStart - 1]) continue;

          if (gridEnd > gridChunks.length) continue; // `word` ends too late
          // bad boundary: can't place the bookending wall
          if (gridEnd < gridChunks.length && gridChunks[gridEnd]) continue;

          // all characters fit
          const fits = wordChunks.every((chunk, idx) => {
            const cell = gridChunks[gridStart + idx];
            return !cell || cell == chunk;
          });
          if (!fits) continue;

          // we good!
          gridFills.push({ entry, pivotIdx: wordPivotIdx});
          pivotFills.add(pivot);
        }
      }
    }
  };

  if (gridChunks[pivotIndex]) {
    fitEm(pivotIndex);
  } else {
    // find words that fit:
    // - previous filled cell from pivot (& include pivot)
    for (let idx = pivotIndex; idx >= 0; idx--) {
      if (gridChunks[idx]) {
        fitEm(idx);
        break
      }
    }

    // find words that fit:
    // - next filled cell from pivot (& include pivot)
    for (let idx = pivotIndex; idx < gridChunks.length; idx++) {
      if (gridChunks[idx]) {
        fitEm(idx);
        break
      }
    }
  }
  gridFills.sort((a, b) => b.entry.score - a.entry.score);
  return { gridFills, cellFills: pivotFills };
}

const toEntry = line => {
  let [word, score] = line.split(';');
  if (!word.match(`^([A-Z]{${chunkLen}})+$`)) return null;

  const chunks = new Set(chunked(word));
  score = +score;
  return { word, score, chunks }
}

const filterMap = (arr, fn) => {
  return arr.reduce((acc, item, idx) => {
    let mapped = fn(item, idx);
    if (mapped != null) acc.push(mapped);
    return acc;
  }, []);
}

const chunked = word => {
  let chunks = [];
  for (let idx = 0; idx < word.length; idx += chunkLen) {
    const chunk = word.substring(idx, idx + chunkLen);
    chunks.push(chunk);
  }
  return chunks;
}
