<script>
  export let dict;
  export let horizontalFills;
  export let verticalFills;
</script>

<div id="cell-data">
  {#if dict}
    <ul>
      <li>{horizontalFills ?? "?"} potential fills horizontally.</li>
      <li>{verticalFills ?? "?"} potential fills vertically.</li>
      <li>{0} potential fills for this cell:
        <ul id="cell-fills">
        </ul>
      </li>
    </ul>
  {:else}
    <div class="spinner-container">
      <img class="spinner" src="spinner.gif" />
    </div>
  {/if}
</div>

<style>
  .spinner-container {
    text-align: center;
  }

  img.spinner {
    width: 99px;
    image-rendering: pixelated;
  }

  #cell-data {
    background-color: lightyellow;
    font-family: Arial;
  }
</style>
