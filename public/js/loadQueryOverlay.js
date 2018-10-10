// Function will load every overlay layer from JSON data.
// Expected input: an object data with an array of json object called data. eg. data.data[0]
// Output: polygons will be added into 'mymap' and queryLayer array.
function loadQueryOverlay(data){

    if(queryLayer.length > 0) {
        let cLayer= queryLayer.pop();
		mymap.removeLayer(cLayer);
        queryLayer = [];
        layerControl.removeLayer(cLayer);
    }
    
    // console.log(data.data);
    var layer = [];
    data.data.map((d)=>{
        layer.push(JSON.parse(d.geom));
    });
    
    let layerStyle = {
        "color": "#4169e1",
        "weight": 4,
        "opacity": 0.4
    };

    layer = L.geoJSON(layer,{
        style: layerStyle
    });
    queryLayer.push(layer);
    mymap.addLayer(layer);
    layerControl.addOverlay(layer, "Overlay Layer");
}