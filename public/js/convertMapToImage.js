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
    html2canvas(map_element).then(canvas => {
        var dataUrl = canvas.toDataURL('image/png');
        var img = new Image();
        img.src = dataUrl;
        img.onload = function () { //Get image width and height and scale it to fit the PDF
            callback(dataUrl, img.width, img.height);
        };
    });
}