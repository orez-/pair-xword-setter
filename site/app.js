const width = 12;
const height = 12;
let selected = null;

const buildGrid = () => {
  const grid = document.getElementById("grid");
  const cells = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      cells.push(`<div class='cell' data-x='${x}' data-y='${y}'></div>`);
    }
  }
  grid.innerHTML = cells.join('');
  grid.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
};

const deselect = () => {
  const grid = document.getElementById("grid");
  if (!selected) { return }
  let {x, y} = selected;
  let cell = grid.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
  if (!cell) { return }
  cell.classList.remove("selected");
}

const selectDomCell = target => {
  deselect();
  target.classList.add("selected");
  selected = {
    x: parseInt(target.dataset.x, 10),
    y: parseInt(target.dataset.y, 10),
  };
}

const selectCell = ({x, y}) => {
  let cell = grid.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
  selectDomCell(cell);
}

window.onload = evt => {
  const grid = document.getElementById("grid");
  buildGrid();
  grid.onclick = evt => {
    const target = evt.target;
    if (!target.classList.contains("cell")) { return }
    selectDomCell(target);
  }
};

window.onkeydown = evt => {
  switch (evt.keyCode) {
    case 37:
      if (selected && selected.x > 0) {
        selectCell({x: selected.x - 1, y: selected.y});
      }
      break;
    case 38:
      if (selected && selected.y > 0) {
        selectCell({x: selected.x, y: selected.y - 1});
      }
      break;
    case 39:
      if (selected && selected.x < width-1) {
        selectCell({x: selected.x + 1, y: selected.y});
      }
      break;
    case 40:
      if (selected && selected.y < height-1) {
        selectCell({x: selected.x, y: selected.y + 1});
      }
      break;
  }
};
