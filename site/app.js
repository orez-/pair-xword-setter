const width = 13;
const height = 13;
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
  if (!selected) return;
  let cell = getCell(selected);
  if (!cell) return;
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

const getCell = ({x, y}) => grid.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);

const selectCell = (target) => {
  let cell = getCell(target);
  selectDomCell(cell);
}

window.onload = evt => {
  const grid = document.getElementById("grid");
  buildGrid();

  grid.onclick = evt => {
    const target = evt.target;
    if (!target.classList.contains("cell")) return;
    selectDomCell(target);
  };

  document.addEventListener('contextmenu', evt => {
    event.preventDefault();
    const target = evt.target;
    if (!target.classList.contains("cell")) return;
    target.style.backgroundColor = "#111";
  });
};

window.onkeydown = evt => {
  switch (evt.keyCode) {
    case 37: // <
      if (selected && selected.x > 0) {
        selectCell({x: selected.x - 1, y: selected.y});
      }
      break;
    case 38: // ^
      if (selected && selected.y > 0) {
        selectCell({x: selected.x, y: selected.y - 1});
      }
      break;
    case 39: // >
      if (selected && selected.x < width-1) {
        selectCell({x: selected.x + 1, y: selected.y});
      }
      break;
    case 40: // v
      if (selected && selected.y < height-1) {
        selectCell({x: selected.x, y: selected.y + 1});
      }
      break;
    case 8: // bksp
      let cell = getCell(selected);
      cell.textContent = cell.textContent.slice(0, -1);
      break;
    default:
      if (evt.ctrlKey || evt.altKey || evt.metaKey) return;
      if (evt.keyCode > 64 && evt.keyCode < 91) {
        let chr = String.fromCharCode(evt.keyCode);
        let cell = getCell(selected);
        cell.textContent += chr;
      }
  }
};
