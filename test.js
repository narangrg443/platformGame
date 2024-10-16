function fetchdata(){
    fetch('url').then(data=>data.json()).then(data=>{

          use(data);
          console.log(data)

    })
}
fetchdata()