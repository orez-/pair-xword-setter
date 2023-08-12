<script>
  import { createEventDispatcher } from 'svelte';

  const cellFillLen = 2;
  const height = 13;
  const width = 13;

  const dispatch = createEventDispatcher();

  let selected = null;
  let grid = Array(width * height).fill(null)
    .map(() => ({wall: false, fill: ""}));

  const setSelected = sel => {
    selected = sel;
    dispatch('cellSelect', {
      verticalPattern: verticalPattern(selected),
      horizontalPattern: horizontalPattern(selected),
    });
  }

  const snagPattern = ({front, back, step, x, y}) => {
    const ERROR = null;
    let chunkIndex = -1;
    let idx = y * width + x;
    if (grid[idx].wall) return ERROR; // XXX
    for(; idx >= front; idx -= step) {
      if (grid[idx].wall) break;
      chunkIndex++;
    }
    const start = idx + step;
    const gridChunks = [];
    for(idx = start; idx < back && !grid[idx].wall; idx += step) {
      const fill = grid[idx].fill;
      if (fill.length && fill.length != cellFillLen) return ERROR;
      gridChunks.push(fill);
    }
    return { pattern: gridChunks, index: chunkIndex };
  }

  const horizontalPattern = ({x, y}) => {
    const row = y * width;
    return snagPattern({
      x, y,
      front: row,
      back: row + width,
      step: 1,
    });
  }

  const verticalPattern = ({x, y}) => snagPattern({
    x, y,
    front: 0,
    back: grid.length,
    step: width,
  });

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
            setSelected({x: selected.x - 1, y: selected.y});
          } else if (selected && selected.y > 0) {
            setSelected({x: width-1, y: selected.y - 1});
          } else {
            setSelected({x: width-1, y: height-1});
          }
        } else {
          if (selected && selected.x < width-1) {
            setSelected({x: selected.x + 1, y: selected.y});
          } else if (selected && selected.y < height-1) {
            setSelected({x: 0, y: selected.y + 1});
          } else {
            setSelected({x: 0, y: 0});
          }
        }
        break;
      case 37: // <
        evt.preventDefault();
        if (selected && selected.x > 0) {
          setSelected({x: selected.x - 1, y: selected.y});
        }
        break;
      case 38: // ^
        evt.preventDefault();
        if (selected && selected.y > 0) {
          setSelected({x: selected.x, y: selected.y - 1});
        }
        break;
      case 39: // >
        evt.preventDefault();
        if (selected && selected.x < width-1) {
          setSelected({x: selected.x + 1, y: selected.y});
        }
        break;
      case 40: // v
        evt.preventDefault();
        if (selected && selected.y < height-1) {
          setSelected({x: selected.x, y: selected.y + 1});
        }
        break;
      case 8: // bksp
        if (!selected) return;
        const idx = selected.y * width + selected.x;
        if (grid[idx].fill.length) {
          grid[idx].fill = "";
        } else if (selected.x != 0 && !grid[idx-1].wall) {
          setSelected({x: selected.x - 1, y: selected.y});
        }
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
          class:error={cell.fill.length > 0 && cell.fill.length < cellFillLen}
          on:click={() => setSelected({x, y})}
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

  .error {
    background-color: lightpink;
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
