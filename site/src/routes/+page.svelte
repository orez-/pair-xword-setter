<script>
  import Grid from '../Grid.svelte';
  import CellInfo from '../CellInfo.svelte';
</script>

<div id="body-wrapper">
  <Grid />
  <CellInfo />
</div>

<style>
  #body-wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-gap: 10px;
  }
</style>
