onmessage = function(url) {
    //console.log(url.data)
    return Promise.all([fetch(url.data).then(
        response => 
        {
            response.arrayBuffer().then(buffer =>
                {
                    postMessage([buffer]); 
                })
        }
    )])
    
}
