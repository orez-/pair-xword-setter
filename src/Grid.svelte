<script>
  import { createEventDispatcher } from 'svelte';
  import { chunked as chunkedGen } from './util';

  export let cellFillLen;
  const chunked = word => chunkedGen(word, cellFillLen);

  const height = 20;
  const width = 20;

  const dispatch = createEventDispatcher();

  let selected = null;
  $: selectedCell = selected && grid[selected.x + selected.y * width];
  $: showClues = selectedCell && !selectedCell.wall;

  let grid = Array(width * height).fill(null)
    .map(() => ({
      wall: false,
      fill: "",
      number: null,
      downClue: null,
      acrossClue: null,
    }));

  const setSelected = sel => {
    selected = {x: sel.x, y: sel.y, x2: sel.x, y2: sel.y};
    dispatchUpdate();
  }

  const dispatchUpdate = () => {
    if (!selected) return;
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
  const setFill = ({front, back, step, x, y, word, pivotIdx}) => {
    let idx = y * width + x - pivotIdx * step;
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
    renumber();
    dispatchUpdate();
  };

  const setAcrossFill = acrossStep(setFill);
  const setDownFill = downStep(setFill);
  export const setAcrossFillAtSelected = ({...args}) => setAcrossFill({...selected, ...args});
  export const setDownFillAtSelected = ({...args}) => setDownFill({...selected, ...args});

  const frontClueCell = ({front, step, x, y, grid}) => {
    // unselected value is an empty object
    // because it simplifies the svelte binds
    if (x == null || y == null) return {};
    let idx = x + width * y;
    if (!grid[idx]) return null;
    for (; idx >= front && !grid[idx].wall; idx -= step) { }
    return grid[idx + step];
  };
  const acrossClueCell = acrossStep(frontClueCell);
  const downClueCell = downStep(frontClueCell);

  // ===

  export const setFillAtSelected = fill => {
    let idx = selected.y * width + selected.x;
    grid[idx].wall = false;  // ᖍ(∙⟞∙)ᖌ
    grid[idx].fill = fill;
    dispatchUpdate();
  }

  const toggleWall = (evt, x, y) => {
    evt.preventDefault();
    const idx = y * width + x;
    grid[idx].wall ^= true;
    if (grid[idx].wall) {
      grid[idx].fill = "";
    }
    renumber();
    dispatchUpdate();
  }

  const renumber = () => {
    let num = 1;
    const setNum = ({idx, topBounded, leftBounded}) => {
      const cell = grid[idx];
      const bounded = topBounded || leftBounded;
      cell.number = null;
      if (!topBounded) cell.downClue = null;
      if (!leftBounded) cell.acrossClue = null;
      if (!cell.wall && bounded) {
        cell.number = num;
        num++;
      }
    };

    let prevWall = true;
    for (let x = 0; x < width; x++) {
      setNum({idx: x, topBounded: true, leftBounded: prevWall});
      prevWall = grid[x].wall;
    }

    for (let y = 1; y < height; y++) {
      const row = y * width;
      const topBounded = grid[row-width].wall;
      setNum({idx: row, topBounded, leftBounded: true});
      for (let x = 1; x < width; x++) {
        const idx = row + x;
        const topBounded = grid[idx-width].wall;
        const leftBounded = grid[idx-1].wall;
        setNum({idx, topBounded, leftBounded});
      }
    }
  }

  const handleCellMouseOver = ({event, x, y}) => {
    if (event.buttons != 1 || selected?.state !== "area") return;
    selected.x2 = x;
    selected.y2 = y;
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

  const cellIsSelected = (selected, x, y) => {
    if (!selected) return false;
    const min_x = Math.min(selected.x, selected.x2);
    const max_x = Math.max(selected.x, selected.x2);
    const min_y = Math.min(selected.y, selected.y2);
    const max_y = Math.max(selected.y, selected.y2);
    return min_x <= x && x <= max_x &&
      min_y <= y && y <= max_y;
  }

  renumber();
  $: selAcrossClueCell = acrossClueCell({...selected, grid});
  $: selDownClueCell = downClueCell({...selected, grid});
</script>

<svelte:window
  on:keydown={handleKey}
  on:mouseup={() => selected.state = null}
/>
<div id="grid-wrapper">
  <div id="grid"
    style="grid-template-columns: repeat({width}, 1fr)"
    on:contextmenu={evt => evt.preventDefault()}
  >
    {#each {length: height} as _, y }
      {#each {length: width} as _, x }
        {@const cell = grid[width * y + x]}
        {@const isSelected = selected && selected.x == x && selected.y == y}
        <div class="cell"
          class:selected-area={cellIsSelected(selected, x, y)}
          class:selected={isSelected}
          class:wall={cell.wall}
          class:error={cell.fill.length > 0 && cell.fill.length < cellFillLen}
          on:mousedown={evt => {
            if (evt.buttons === 1) {
              setSelected({x, y});
              selected.state = "area";
            }
          }}
          on:mouseover={event => handleCellMouseOver({event, x, y})}
          on:contextmenu={evt => toggleWall(evt, x, y)}
        >
          {#if cell.number}
            <span class="cell-number">{cell.number}</span>
          {/if}
          <span class="cell-fill">{cell.fill}</span>
        </div>
      {/each}
    {/each}
  </div>
  {#if showClues}
    <div class="clue">
      <label for="across-clue">{selAcrossClueCell.number}A</label>
      <input id="across-clue"
        type="text"
        bind:value={selAcrossClueCell.acrossClue}
        on:keydown={evt => evt.stopPropagation()}
      />
    </div>
    <div class="clue">
      <label for="down-clue">{selDownClueCell.number}D</label>
      <input id="down-clue"
        type="text"
        bind:value={selDownClueCell.downClue}
        on:keydown={evt => evt.stopPropagation()}
      />
    </div>
  {/if}
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
    width: 2em;
    height: 2em;
    text-align: center;
    font-family: "DejaVu Sans Mono", monospace;
    user-select: none;
    position: relative;
  }

  .error {
    background-color: lightpink;
  }

  .selected.selected-area.wall {
    background-color: #441;
  }

  .selected.selected-area {
    background-color: yellow;
  }

  .selected-area.wall {
    background-color: #234;
  }

  .selected-area {
    background-color: #ace;
  }

  .wall {
    background-color: #111;
  }

  .cell-number {
    font-size: 0.5em;
    left: 1px;
    top: 1px;
    position: absolute;
  }

  .cell-fill {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 2px;
    margin-left: auto;
    margin-right: auto;
  }

  .clue label {
    display: block;
  }

  .clue input {
    width: 100%;
  }
</style>
