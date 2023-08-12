<script>
  export let dict;
  export let horizontalFills;
  export let verticalFills;
  export let cellFills;
</script>

<div id="cell-data">
  {#if dict}
    <ul>
      <li>{horizontalFills ?? "?"} potential fills horizontally.</li>
      <li>{verticalFills ?? "?"} potential fills vertically.</li>
      <li>{cellFills?.length ?? "?"} potential fills for this cell:
        {#if cellFills}
          <div class="grid">
            {#each cellFills as fill}
              <a>{fill}</a>
            {/each}
          </div>
        {/if}
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

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(2em, 1fr));
  }
</style>
