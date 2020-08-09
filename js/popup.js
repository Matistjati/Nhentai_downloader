document.getElementById("Download button").addEventListener("click", DownloadDoujinshi);

function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a");
                var url = URL.createObjectURL(file);
        a.href = url;
        console.log(filename)
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}


function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function createWorker(i) {
    return new Promise(function(resolve) {
        var v = new Worker('js/worker.js');
        v.postMessage(i);
        v.onmessage = function(event){
            //console.log(event.data[0])
            resolve(event.data[0]);
        };
    });
}

function getImageType(extension)
{
    if (extension == "j")
    {
        return "jpg"
    }
    else if (extension == "p")
    {
        return "png"
    }
    else
    {
        console.log("Unknown image type: " + extension)
        return "jpg"
    }
}

async function DownloadDoujinshi()
{  

    if (window.Worker) {
        
        /*var a = []
        for (i=0;i<10;i++)
        {
            let myWorker = new Worker("worker.js");
            myWorker.onmessage = function(e)
                {
                    //document.getElementById('DebugText').innerHTML = e.data;
                    a[e.data] = e.data * e.data;
                }
            myWorker.postMessage([i])
        }
        
        console.log(a)
        console.log(a)
        console.log(a)*/
        chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
        {
            var url = tabs[0].url;
            console.log(url)
            if (url.includes("nhentai.net/g/"))
            {
                
                var parts = url.split("/")
                var indexOfG = parts.findIndex(i => i === "g");
                var sauce = parts[indexOfG + 1]
                
                fetch("https://nhentai.net/api/gallery/" + sauce).then(
                    bookInfo => 
                    {
                        bookJson = bookInfo.json().then(
                            json => 
                            {
                                var start = Date.now();
                                var promises = [];
                                console.log(json["images"])
                                console.log(json["images"]["pages"])
                                console.log("https://i.nhentai.net/galleries/" + json["media_id"]+ "/"+i+"."+getImageType(json["images"]["pages"][i-1]))
                                for(var i = 1; i < json["num_pages"]+1; i++) {
                                    promises.push(createWorker("https://i.nhentai.net/galleries/" + json["media_id"]+ "/"+i+"."+getImageType(json["images"]["pages"][i-1]["t"])));
                                    //console.log(i)
                                }
                                
                                Promise.all(promises)
                                    .then(function(data) {
                                        //console.log(data)
                                        console.log("Time to download images into ram: " + (Date.now()-start) / 1000)
                                        imageDownloadTime = Date.now()
                                        var zip = new JSZip();
                                        console.log("starting compression")
                                        for (i=0;i<data.length;i++)
                                        {
                                            zip.file((i+1)+".jpg", data[i]);
                                        }
                                        
                                        zip.generateAsync({type:"blob", compression:"STORE"}).then(function(content) {
                                            // see FileSaver.js
                                            download(content, "example.zip");
                                            console.log("Time to download zip: " + (Date.now()-imageDownloadTime) / 1000)
                                            console.log("Total time: " + (Date.now()-start) / 1000)
                                        });
                                        
                                    });
                            })
                    })
            }
        })
        
                
            
        
            
            
    }
    else
    {
        console.log('Your browser doesn\'t support web workers.')
    }

    //chrome.downloads.download({url: "https://i.nhentai.net/galleries/770497/1.jpg", filename: "hi/DABBED.jpg", conflictAction: "overwrite"})

    /*var debugText = document.getElementById('DebugText');
    
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
    {
        var url = tabs[0].url;
        debugText.innerHTML = url
        if (url.includes("nhentai.net/g/"))
        {
            var parts = url.split("/")
            var indexOfG = parts.findIndex(i => i === "g");
            var sauce = parts[indexOfG + 1]
            
            fetch("https://nhentai.net/api/gallery/" + sauce).then(
                bookInfo => 
                {
                    bookJson = bookInfo.json().then(
                        json => 
                        {
                            safe_title = json["title"]["english"]
                            black_list = ["/","\\",":","*","?","\"","<",">","|"]
                            black_list.forEach(character => {
                                safe_title = safe_title.split(character).join("")
                            });
                            
                            for (page = 0; page <= json["num_pages"]; page++)
                            {
                                chrome.downloads.download({url: `https://i.nhentai.net/galleries/${json['media_id']}/${page}.jpg`, filename: `${safe_title}/${page}.jpg`, conflictAction: "overwrite"})
                            }
                        }
                    );
                    
                }
            )
        }
    });*/

    
}



