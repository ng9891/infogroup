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
async function convertDomToImageAsync(containerID) {
    let element = document.getElementById(containerID);
    try {
        let dataUrl = await domtoimage.toPng(element);
        return await createImage(dataUrl);
    } catch (error) {
        // console.error(`Error on printing ${containerID}`, error);
        return Promise.reject(error);
    }
}
async function convertDomToImage_html2canvasAsync(containerID) {
    let element = document.getElementById(containerID);
    try {
        let canvas = await html2canvas(element, {
            allowTaint: false,
            useCORS: true,
            foreignObjectRendering: true,
            letterRendering: true
        });
        var dataUrl = canvas.toDataURL('image/png');
        return await createImage(dataUrl);
    } catch(error){
        return Promise.reject(error);
    }
}
// Helper function to create an image with dataURL synchronously
function createImage(dataUrl) {
    return new Promise((resolve, reject) => {
        let img = new Image()
        img.onerror = reject
        img.src = encodeURI(dataUrl);
        img.onload = () => {
            resolve({
                imgUrl: dataUrl,
                width: img.width,
                height: img.height
            });
        }
    })
}