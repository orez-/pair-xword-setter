<script>
  import { onMount } from 'svelte';
  import Grid from '../Grid.svelte';
  import CellInfo from '../CellInfo.svelte';
  import loadDict from '../dict.js';

  let dict = null;
  let verticalFills = null;
  let horizontalFills = null;
  let cellFills = null;
  onMount(async () => {
    dict = await loadDict();
  });

  const intersect = (left, right) => {
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
    {
      const { pattern, index } = evt.detail.verticalPattern;
      const { gridFills, cellFills } = dict.filterFit(pattern, index);
      verticalFills = gridFills.length;
      allCellFills = cellFills;
    }

    {
      const { pattern, index } = evt.detail.horizontalPattern;
      const { gridFills, cellFills } = dict.filterFit(pattern, index);
      horizontalFills = gridFills.length;
      allCellFills = intersect(allCellFills, cellFills);
    }
    cellFills = [...allCellFills];
    cellFills.sort();
  }
</script>

<div id="body-wrapper">
  <Grid on:cellSelect={generateCellOptions} />
  <CellInfo {dict} {verticalFills} {horizontalFills} {cellFills} />
</div>

<style>
  #body-wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-gap: 10px;
  }
</style>
