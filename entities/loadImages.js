
function loadImage(imgSrc) {
    return Promise.all(
      imgSrc.map((path) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = path; // Set src BEFORE onload
          img.onload = () => resolve({ path, img });
          img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
        });
      })
    );
  }
 