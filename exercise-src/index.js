const layersRef = document.querySelector('#layers');
const canvasRef = document.querySelector('#canvas')

// const url = 'http://localhost:9000/exercise-src';
const url = ' https://lab.pikcells.com/code-exercise';

// save image function
function saveImage() {
  // create link element
  const dlLink = document.createElement('a');

  // set download name
  dlLink.download = 'image.png';

  // set href from canvas data url
  dlLink.href = canvasRef.toDataURL('image/png');
  document.body.appendChild(dlLink);

  // click button
  dlLink.click();
  
  // remove download link
  document.body.removeChild(dlLink);
}

// Set Layer stak
function setStack() {
  // retrieve data
  const { layers, config } = getData();

  // get canvas context
  const ctx = canvasRef.getContext('2d');

  layers.forEach((layer, index) => {
    // find selected items in config
    const item = layer.items.filter(item => item.order === config[index])

    // create canvas image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `${url}/images/${item[0].imgSrc}`;

    // set height and width
    canvasRef.width = 1500;
    canvasRef.height = 1000;

    // draw image after load
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
    }
  })
}


// change layer order
function changeLayerOrder(layer, itemOrder) {
  // get data
  let data = getData()
  
  // update config
  data.config[layer] = Number(itemOrder);

  // save config
  saveData(data, true)

  // update ui
  initLayers();
  setStack();
}

// helper function, sort
function sortItems(items) {
  return items.sort((a, b) => a.order - b.order);
}

// UI helper, show layer list options
function showLayerList(layer, layerIndex, selected) {
  let listItems = ''

  // sort items
  const items = sortItems(layer.items);

  items.forEach((item) => {
    // set selected indicator
    const itemSelected = `<span class='selected'>selected<span>`;

    // set button change
    const btn = `<button onClick="changeLayerOrder('${layerIndex}','${item.order}')">select</button>`

    // add list items
    listItems +=
      `<li id='layer-${layerIndex}-${item.order}'>${item.name} ${selected === item.order ? itemSelected : btn} </li>`
  })
  return listItems;
}

// Ui initalize layers 
function initLayers() {
  // retrieve data
  const data = getData()
  layersRef.innerHTML = '';

  data.layers.forEach((layer, index) => {
    // create list group
    const listContainer = document.createElement('ul', { id: index })

    // hydrate list elements
    listContainer.innerHTML = showLayerList(layer, index, data.config[layer.order]);
    layersRef.append(listContainer);
  })
}

// data fetch
async function fetchData() {
  try {
    const response = await fetch(`${url}/data.json`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

// helper, save data to localstorage
function saveData(data, update = false) {
  if (!update) {
    localStorage.removeItem('data')
  }
  localStorage.setItem('data', JSON.stringify({ layers: data.layers, config: data[Object.keys(data)[1]] }));
}

// helper, get data from localstorage
function getData() {
  return JSON.parse(localStorage.getItem('data'))
}

// initialize app
async function initApp() {
  try {
    const data = await fetchData()
    saveData(data);
    initLayers();
    setStack();

  } catch (error) {
    console.log(error)
  }
}

// entry point - tee hee
initApp()