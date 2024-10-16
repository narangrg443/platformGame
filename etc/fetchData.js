


function fetchData(){
  


   
    fetch("./map.json")
    .then((data) => data.json())
    .then((data) => {
      
       assignEntities(data);
        //print(player);
    })

    .catch((error) => console.error(error));
    
    
    }

