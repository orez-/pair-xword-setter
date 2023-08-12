<script>
  import { onMount } from 'svelte';
  import Grid from '../Grid.svelte';
  import CellInfo from '../CellInfo.svelte';
  import loadDict from '../dict.js';

  let dict = null;
  let verticalFills = null;
  let horizontalFills = null;
  onMount(async () => {
    dict = await loadDict();
  });

  const generateCellOptions = evt => {
    {
      const { pattern, index } = evt.detail.verticalPattern;
      const vfits = dict.filterFit(pattern, index);
      verticalFills = vfits.length;
    }

    {
      const { pattern, index } = evt.detail.horizontalPattern;
      const hfits = dict.filterFit(pattern, index);
      horizontalFills = hfits.length;
    }
  }
</script>

<div id="body-wrapper">
  <Grid on:cellSelect={generateCellOptions} />
  <CellInfo {dict} {verticalFills} {horizontalFills} />
</div>

<style>
  #body-wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-gap: 10px;
  }
</style>
