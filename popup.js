document.getElementById("Download button").addEventListener("click", DownloadDoujinshi);

function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
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

function DownloadDoujinshi()
{
    //chrome.downloads.download({url: "https://i.nhentai.net/galleries/770497/1.jpg", filename: "hi/DABBED.jpg", conflictAction: "overwrite"})

    var debugText = document.getElementById('DebugText');
    
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
    });

    
}



