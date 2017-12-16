const requestModule = require('request') //npm module for easy http requests
var url = 'https://backend-challenge-summer-2018.herokuapp.com/challenges.json?id=1&page=1';
var allData = [] ;
pageCounter = 1;
var urlArr = [];
var masterMenu = [];
var childArray = [];

/*
    MAIN
*/
requestModule.get(url, function(err, res, data){
    var data = JSON.parse(data);
    allData.push(data.menus);
    pageCounter++;
    for(var i = data.pagination.per_page ; i < data.pagination.total ; i+=data.pagination.per_page){
        url = url.substring(0,url.length - 1);
        url = url + pageCounter;
        urlArr.push(url);
        pageCounter++;
    }
    for(var i = 0 ; i < urlArr.length ; i++){
        requestModule.get(urlArr[i],function(err,res,data){
            var data = JSON.parse(data);
            pageCounter++;
            allData.push(data.menus);
        });
    }

    //Wait 4 Seconds for the API Response
    setTimeout(function(){
            for(var i = 0 ; i <allData.length; i++){
                for(var x = 0 ; x < allData[i].length ; x++){
                    masterMenu.push(allData[i][x]); //Pushes all menu elements
                }
            }
            buildResponse(masterMenu);
        },4000);
})

/*
    FUNCTIONS
*/
function buildResponse(jsonObj){
    const menu = jsonObj;

    var rootNodes = [];                    //Root Nodes 
    var arr = [];

    var validMenu = [];
    var invalidMenu = [];
    var response = {};

    //Push The Roots
    for(var i = 0 ; i < menu.length; i++){
        if(menu[i].parent_id === undefined){
            rootNodes.push(menu[i]);
        }
    }
    //console.log(rootNodes)
    //Check if valid
    for(var i = 0 ; i < rootNodes.length ;i++){
        if( validMenuParent(rootNodes[i]) === false){
            invalidMenu.push(rootNodes[i]);
        }
        else if( validTraverseCheck(rootNodes[i]) === false){
            invalidMenu.push(rootNodes[i]);
        }
        else{
            validMenu.push(rootNodes[i])
        }
    }
    //console.log(validMenu);
    //console.log(invalidMenu);

    //--Valid object
    response.valid_menus = [];
    response.invalid_menus = [];
    //response.invalid_menus.push(buildResponseObj(invalidMenu[0]));
    
    
    for(var i = 0 ; i < validMenu.length ; i++){
        response.valid_menus.push(buildResponseObj(validMenu[i]));
    }

    //--Invalid Objects
    for(var i = 0 ; i < invalidMenu.length ; i++){
        response.invalid_menus.push(buildResponseObj(invalidMenu[i]));
    }
    
    console.log(response);
}

//Build the response
function buildResponseObj(node){
    var response = {};
    response.root_id = node.id;
    
    buildChildren(node);
    console.log(childArray);
    
    return(response);  
}

//Build child array
function buildChildren(node){
    var found = false;
    //Does it already exist 
    for(var i = 0 ; i < node.child_ids.length ; i++){
        for(var x = 0 ;x < childArray.length ; x++){
            if(childArray[x] === node.child_ids[i]){
                return;
            }
        }
    }  
    //Nope
    for(var i = 0 ; i < node.child_ids.length ; i++){
        childArray.push(node.child_ids[i]);
    }
    
    for(var x = 0 ; x < node.child_ids.length; x++){
        for(var i = 0 ; i < masterMenu.length; i++){
            if(masterMenu[i].id === node.child_ids[x]){
                buildChildren(masterMenu[i]);
            }
        }
    } 
    return;   //Done looping
}


//DFS Check
function validTraverseCheck(rootNode){
    var usedNode = [];
    var currNodes = rootNode.child_ids;
    usedNode.push(rootNode.id);

    for(var l = 0 ; l < 4 ; l++){   //4 LAYERS DEEP!!!!!!
        //Check
        for(var i = 0 ; i < currNodes.length; i++){
            for(var x = 0 ; x < usedNode.length ; x++){
                if(usedNode[x] === currNodes[i]){
                    return(false);
                }
            }
        }

        let childNode = [];
        //Run Through the currNodes Finding their children
        for(var i = 0 ; i < currNodes.length; i ++){
            for(var x = 0 ; x < masterMenu.length ; x++){
                if(masterMenu[x].id === currNodes[i]){
                    for(var y = 0 ; y < masterMenu[x].child_ids.length;y++){
                        childNode.push(masterMenu[x].child_ids[y]);
                    }
                }
            }
        }
        currNodes = childNode;
    }
    return(true);
}

//Valid Parent Pointing
function validMenuParent(node){
    var currNode = node.id;
    var childNode = node.child_ids;
    if(childNode !== null){
        for(var i = 0 ; i < masterMenu.length ;i++){     //Go throught all the menu nodes
            for(var x = 0; x <childNode.length ; x++){   //Comparing the children of the current node
                if(masterMenu[i].id === childNode[x]){
                    //Parent Node Check Proper Point
                    if(masterMenu[i].parent_id !== currNode){ 
                        return(false);
                    }  
                    //Recursive Call
                    else{
                        validMenuParent(masterMenu[i]);
                    }
                }
            }
        }
        return(true);
    }
}

