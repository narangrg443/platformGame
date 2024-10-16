
 
function init() {

    loadImage(ImagesSrc)
      .then((loadedImages) => {
        loadedImages.forEach(({ path, img }) => {
          LoadedImages[path] = img; 
        });  
           
        animate();
      })
      .catch((error) => {
        console.error("Error loading images:", error);
      });
  }

  
  
  