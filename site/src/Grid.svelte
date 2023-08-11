<script>
  const cellFillLen = 2;
  const height = 13;
  const width = 13;

  let selected = null;
  let grid = Array(width * height).fill(null)
    .map(() => ({wall: false, fill: ""}));

  const toggleWall = (evt, x, y) => {
    evt.preventDefault();
    const idx = y * width + x;
    grid[idx].wall ^= true;
    if (grid[idx].wall) {
      grid[idx].fill = "";
    }
  }

  const handleKey = evt => {
    switch (evt.keyCode) {
      case 9: // tab
        evt.preventDefault();
        if (evt.shiftKey) {
          if (selected && selected.x > 0) {
            selected = ({x: selected.x - 1, y: selected.y});
          } else if (selected && selected.y > 0) {
            selected = ({x: width-1, y: selected.y - 1});
          } else {
            selected = {x: width-1, y: height-1};
          }
        } else {
          if (selected && selected.x < width-1) {
            selected = ({x: selected.x + 1, y: selected.y});
          } else if (selected && selected.y < height-1) {
            selected = ({x: 0, y: selected.y + 1});
          } else {
            selected = {x: 0, y: 0};
          }
        }
        break;
      case 37: // <
        if (selected && selected.x > 0) {
          selected = ({x: selected.x - 1, y: selected.y});
        }
        break;
      case 38: // ^
        if (selected && selected.y > 0) {
          selected = ({x: selected.x, y: selected.y - 1});
        }
        break;
      case 39: // >
        if (selected && selected.x < width-1) {
          selected = ({x: selected.x + 1, y: selected.y});
        }
        break;
      case 40: // v
        if (selected && selected.y < height-1) {
          selected = ({x: selected.x, y: selected.y + 1});
        }
        break;
      case 8: // bksp
        if (!selected) return;
        const idx = selected.y * width + selected.x;
        grid[idx].fill = "";
        break;
      default:
        if (!selected || evt.ctrlKey || evt.altKey || evt.metaKey) return;
        if (evt.keyCode > 64 && evt.keyCode < 91) {
          const chr = String.fromCharCode(evt.keyCode);
          const idx = selected.y * width + selected.x;
          if (grid[idx].wall) return;
          if (grid[idx].fill.length < cellFillLen) {
            grid[idx].fill += chr;
          }
        }
    }
  };
</script>

<svelte:window on:keydown={handleKey} />
<div id="grid-wrapper">
  <div id="grid" style="grid-template-columns: repeat({width}, 1fr)">
    {#each {length: height} as _, y }
      {#each {length: width} as _, x }
        {@const isSelected = selected && selected.x == x && selected.y == y}
        {@const cell = grid[width * y + x]}
        <div class="cell"
          class:selected={isSelected}
          class:wall={cell.wall}
          on:click={() => selected = {x, y}}
          on:contextmenu={evt => toggleWall(evt, x, y)}
        >{cell.fill}</div>
      {/each}
    {/each}
  </div>
</div>

<style>
  #grid-wrapper {
    display: inline-block;
  }

  #grid {
    display: grid;
    background-color: #111;
    grid-gap: 1px;
    padding: 1px;
  }

  .cell {
    background-color: white;
    width: 1.5em;
    height: 1.5em;
    text-align: center;
    font-family: "DejaVu Sans Mono", monospace;
    user-select: none;
  }

  .selected.wall {
    background-color: #441;
  }

  .selected {
    background-color: yellow;
  }

  .wall {
    background-color: #111;
  }
</style>
