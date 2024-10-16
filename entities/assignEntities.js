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
              
               player.y=30*13.7;
               player.h=30;
               player.w=30;
               player.controllerEvent();
       
            }
          });
        }
        //WALL
        if (data.name === "collision") {
          data.objects.forEach((obj) => {
            if (obj.name == "wall") {
              Walls.push(new Wall(obj));
            }
            //PLATFORMS
            if (obj.name === "platform") {
              Platforms.push(new Platform(obj));
            }
            //DOORS
            if (obj.name === "startDoor" || obj.name === "finishDoor") {
              Doors.push(obj);
            }
  
            //EMEMYS
            if (obj.name === "enemy") {
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