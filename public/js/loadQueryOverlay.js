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