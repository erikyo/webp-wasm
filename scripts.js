"use strict";

async function loadImage(src) {
  // Load image
  const res = await fetch(src);
  const blob = await res.blob();
  const img = await createImageBitmap(blob);

  const imgEl = document.createElement('img');
  imgEl.src = URL.createObjectURL(blob);
  document.querySelector('.output').appendChild(imgEl)

  // Make canvas same size as image
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  // Draw image onto canvas
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}


const importObject = {
  imports: {
    imported_func: arg => {
      console.log(arg);
    }
  }
};


Module.onRuntimeInitialized = async (_) => {
  console.log("wasm loaded ");

  const api = {
    version: Module.cwrap("version", "number", []),
    create_buffer: Module.cwrap("create_buffer", "number", ["number", "number"]),
    destroy_buffer: Module.cwrap("destroy_buffer", "", ["number"]),
    encode: Module.cwrap("encode", "", ["number", "number", "number", "number"]),
    free_result: Module.cwrap("free_result", "", ["number"]),
    get_result_pointer: Module.cwrap("get_result_pointer", "number", []),
    get_result_size: Module.cwrap("get_result_size", "number", []),
  };

  console.log("libWebp v" + api.version().toString())

  const image = await loadImage('https://source.unsplash.com/featured/800x800');

  const p = api.create_buffer(image.width, image.height);
  Module.HEAP8.set(image.data, p);
  api.encode(p, image.width, image.height, 50);
  const resultPointer = api.get_result_pointer();
  const resultSize = api.get_result_size();
  const resultView = new Uint8Array(Module.HEAP8.buffer, resultPointer, resultSize);
  const result = new Uint8Array(resultView);
  api.free_result(resultPointer);
  api.destroy_buffer(p);

  const blob = new Blob([result], {type: 'image/webp'});
  const blobURL = URL.createObjectURL(blob);
  const img = document.createElement('img');
  img.src = blobURL;
  document.querySelector('.output').appendChild(img)
};
