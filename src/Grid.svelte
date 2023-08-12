<script>
  import { createEventDispatcher } from 'svelte';
  import { chunked as chunkedGen } from './util';

  export let cellFillLen;
  const chunked = word => chunkedGen(word, cellFillLen);

  const height = 20;
  const width = 20;

  const dispatch = createEventDispatcher();

  let selected = null;
  let grid = Array(width * height).fill(null)
    .map(() => ({wall: false, fill: ""}));

  const setSelected = sel => {
    selected = sel;
    dispatchUpdate();
  }

  const dispatchUpdate = () => {
    let idx = selected.y * width + selected.x;
    dispatch('update', {
      downPattern: downPattern(selected),
      acrossPattern: acrossPattern(selected),
      cell: grid[idx],
    });
  }

  // silly overkill decorators for fns which step through
  // the grid either Down or Across.
  // The decorated function should be generic over, and accept,:
  // - `x` and `y`, some starting position
  // - `front`, representing the index of the start of the axis (inclusive)
  // - `back`, representing the index past the end of the axis (exclusive)
  // - `step`, the amount to step the index by

  const downStep = fn => ({x, y, ...kwargs}) => fn({
    x, y, ...kwargs,
    front: 0,
    back: grid.length,
    step: width,
  });

  const acrossStep = fn => ({x, y, ...kwargs}) => {
    const row = y * width;
    return fn({
      x, y, ...kwargs,
      front: row,
      back: row + width,
      step: 1,
    });
  }

  // fns for fetching the "fill pattern" around some coordinate.
  // A "pattern" (: [String]) is the cell fill before and after
  // the coordinate in the given axis, from wall to wall.

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
      // XXX: omit partially-filled cells, for now
      if (!fill.length || fill.length == cellFillLen) {
        gridChunks.push(fill);
      }
    }
    return { pattern: gridChunks, index: chunkIndex };
  }

  const acrossPattern = acrossStep(snagPattern);
  const downPattern = downStep(snagPattern);

  // fns for setting a full clue starting at some coordinate.
  // delimits the clue with walls, if needed.

  // XXX: does not check that this is legal fill
  const setFill = ({front, back, step, x, y, word}) => {
    let idx = y * width + x;
    if (front <= idx - step) {
      grid[idx - step].fill = "";
      grid[idx - step].wall = true;
    }
    for (const chunk of chunked(word)) {
      grid[idx].fill = chunk;
      grid[idx].wall = false;
      idx += step;
    }
    if (idx < back) {
      grid[idx].fill = "";
      grid[idx].wall = true;
    }
    dispatchUpdate();
  };

  const setAcrossFill = acrossStep(setFill);
  const setDownFill = downStep(setFill);

  // ===

  const toggleWall = (evt, x, y) => {
    evt.preventDefault();
    const idx = y * width + x;
    grid[idx].wall ^= true;
    if (grid[idx].wall) {
      grid[idx].fill = "";
    }
    dispatchUpdate();
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
          dispatchUpdate();
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
            dispatchUpdate();
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
