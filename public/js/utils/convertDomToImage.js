/*
* Async functions used for the exporting feature of the website.
* Converts DOM elements into dataURLs to be exported on a PDF
*
* Dependencies: DOMtoImage.js and html2Canvas
*
* Expected input: A string with the id of the DOM element. eg 'infoContainer'
                 for the charts on the site and the leaflet map.
*
* Output: Returns an object containning the dataURL of the image, width and height.
*/
async function convertDomToImageAsync(containerName, option= {}) {
  return new Promise(async (resolve, reject) => {
    if (typeof containerName !== 'string') return reject('Invalid input');
    let element;
    if (containerName.startsWith('#')) element = document.getElementById(containerName.slice(1));
    else if (containerName.startsWith('.')) element = document.getElementsByClassName(containerName.slice(1))[0];
    try {
      let dataUrl = await domtoimage.toPng(element,option).catch((e) => {
        throw e;
      });
      let img = await createImage(dataUrl);
      return resolve(img);
    } catch (error) {
      return reject(error);
    }
  });
}
async function convertDomToImage_html2canvasAsync(containerName) {
  if (typeof containerName !== 'string') return Promise.reject('Invalid input');
  let element;
  if (containerName.startsWith('#')) element = document.getElementById(containerName.slice(1));
  else if (containerName.startsWith('.')) element = document.getElementsByClassName(containerName.slice(1))[0];
  try {
    let canvas = await html2canvas(element, {
      allowTaint: false,
      useCORS: true,
      foreignObjectRendering: true,
      letterRendering: true,
    });
    var dataUrl = canvas.toDataURL('image/png');
    return await createImage(dataUrl);
  } catch (error) {
    return Promise.reject(error);
  }
}
// Helper function to create an image with dataURL synchronously
function createImage(dataUrl) {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.src = encodeURI(dataUrl);
    img.onload = () => {
      resolve({
        imgUrl: dataUrl,
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = (e)=>{
      console.log(e);
    };
  });
}
