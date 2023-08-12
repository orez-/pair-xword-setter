<script>
  import { onMount } from 'svelte';
  import Grid from '../Grid.svelte';
  import CellInfo from '../CellInfo.svelte';
  import loadDict from '../dict.js';

  const cellFillLen = 2;
  let dict = null;
  let verticalFills = null;
  let horizontalFills = null;
  let cellFills = null;
  onMount(async () => {
    dict = await loadDict();
  });

  const intersect = (left, right) => {
    // XXX: should probably clone here.
    if (!left || !right) return left || right;
    let both = new Set;
    for (const elem of right) {
      if (left.has(elem)) {
        both.add(elem);
      }
    }
    return both;
  }

  const generateCellOptions = evt => {
    let allCellFills;
    const getStats = ({ pattern, index }) => {
      if (pattern.some(cell => cell)) {
        const { gridFills, cellFills } = dict.filterFit(pattern, index);
        allCellFills = intersect(allCellFills, cellFills);
        return gridFills;
      }
      return null;
    }

    verticalFills = getStats(evt.detail.verticalPattern);
    horizontalFills = getStats(evt.detail.horizontalPattern);

    // Limit to entries that are fill-able on the other axis.
    // XXX: should this be toggleable?
    verticalFills = verticalFills?.filter(({ entry, pivotIdx }) => {
      let idx = pivotIdx * cellFillLen;
      let pivot = entry.word.slice(idx, idx + cellFillLen);
      return allCellFills.has(pivot);
    });
    horizontalFills = horizontalFills?.filter(({ entry, pivotIdx }) => {
      let idx = pivotIdx * cellFillLen;
      let pivot = entry.word.slice(idx, idx + cellFillLen);
      return allCellFills.has(pivot);
    });

    cellFills = [...allCellFills];
    cellFills.sort();
  }
</script>

<svelte:head>
  <title>Pair XWord Setter</title>
</svelte:head>

<div id="body-wrapper">
  <Grid on:cellSelect={generateCellOptions} {cellFillLen} />
  <CellInfo {dict} {verticalFills} {horizontalFills} {cellFills} {cellFillLen} />
</div>

<style>
  #body-wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-gap: 10px;
  }
</style>
