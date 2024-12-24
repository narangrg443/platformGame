 function assignEntities(data){
  const p=null;
      
    Map = data;
    // console.log(Map)
    
    if (Map) {
      JsonData=Map;
      Map.layers.forEach((data) => {

        //IMAGE LAYER
        if (data.name === "imageLayer") {
          ImageObj.push(data);
  
        }
        if (data.name === "player") {
          data.objects.forEach((p) => {
            //player
            if (p.name === "player") {
              player = new Player(p);
              
               player.controllerEvent();
       
            }
          });
        }
        //WALL
        if (data.name === "collision") {
        
          data.objects.forEach((obj) => {
           
            if (obj.name == "wall") {
            obj=change(obj); 
              // Walls.forEach(e=>{
              //   e.x=camera.x+e.x/SCALE+TILE_WIDTH
              //   e.y=camera.y+e.y/SCALE

              //   e.w/=SCALE;
              //   e.h/=SCALE;
              // })
        

            }
            //PLATFORMS
            if (obj.name === "platform") {
              obj=change(obj); 
              Platforms.push(new Platform(obj));
            }
            //DOORS
            if (obj.name === "startDoor" || obj.name === "finishDoor") {
              Doors.push(obj);
            }
  
            //EMEMYS
            if (obj.name === "enemy") {
              obj=change(obj); 
              Enemys.push(new Enemy(obj));
            }

            //POLYGONS
            if(obj.name=='polygon'){
              //print(obj)
              Polygons.push(new  Polygon(obj))

            }
          });
        }
      });
         

  

      init();

    }

    }