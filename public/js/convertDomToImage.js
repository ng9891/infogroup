function convertMapToImage(containerID, callback) {
    let map_element = document.getElementById(containerID);
    domtoimage.toPng(map_element)
        .then(function (dataUrl) {
            let img = new Image();
            img.src = encodeURI(dataUrl);
            img.onload = function () { //Get image width and height and scale it to fit the PDF
                callback(dataUrl, img.width, img.height);
            };
        })
        .catch(function (error) {
            console.error(`Error on printing ${containerID}`, error);
            callback();
            // throw error;
        });
}

function convertMapToImage_html2canvas(containerID, callback) {
    let map_element = document.getElementById(containerID);
    html2canvas(map_element, {
        allowTaint: false,
        useCORS: true,
        foreignObjectRendering: true,
        letterRendering: true
    }).then(canvas => {
        var dataUrl = canvas.toDataURL('image/png');
        var img = new Image();
        img.src = dataUrl;
        img.onload = function () { // Get image width and height and scale it to fit the PDF
            callback(dataUrl, img.width, img.height);
        };
    });
}
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