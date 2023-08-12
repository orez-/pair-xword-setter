<script>
  export let dict;
  export let horizontalFills;
  export let verticalFills;
  export let cellFills;
</script>

<div id="cell-data">
  {#if dict}
    <ul>
      <li>{horizontalFills?.length ?? "?"} potential fills horizontally.
        {#if horizontalFills}
          <div class="word-grid">
            {#each horizontalFills.slice(0, 100) as entry}
              <div>{entry.entry.word}</div>
            {/each}
          </div>
        {/if}
      </li>
      <li>{verticalFills?.length ?? "?"} potential fills vertically.
        {#if verticalFills}
          <div class="word-grid">
            {#each verticalFills.slice(0, 100) as entry}
              <div>{entry.entry.word}</div>
            {/each}
          </div>
        {/if}
      </li>
      <li>{cellFills?.length ?? "?"} potential fills for this cell:
        {#if cellFills}
          <div class="letter-grid">
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

  .word-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .letter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(2em, 1fr));
  }
</style>
