class Button {
    constructor(x = 100, y = 100, radius = 20, canvas, type = "button", text = "") {
       //inner circle and button attrib
        this.x = x;
        this.y = y;
        this.r = radius;
        this.type = type;

        //outer circle for analog
        this.R = this.r * 2;
        this.X = this.x;
        this.Y = this.y;
        
        this.text = text;
        this.pressed = false;
        this.id = null;
        this.direction = { dx: 0, dy: 0 };
        this.opacity = 0.8;
    }

    draw(context) {
        if (!context) {
            console.error("Context is undefined or null.");
            return;
        }

        context.save();
        context.globalAlpha = this.opacity;

        if (this.type === 'button') {
            context.beginPath();
            context.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            context.font = `${this.r}px Arial`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            const text = this.text.charAt(0);
            context.fillText(text, this.x, this.y);
            context.closePath();
            context.stroke();
        } else if (this.type === "analog") {
            context.beginPath();
            context.arc(this.X, this.Y, this.R, 0, Math.PI * 2);
            context.closePath();
            context.stroke();

            context.beginPath();
            context.fillStyle = "yellow";
            context.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            context.fill();
            context.closePath();
        } else {
            console.error('Incorrect type: Use "button" or "analog"');
            context.restore();
            return;
        }
        context.restore();
    }
}

// Controller object
const controller = {
    saveButton: {
        x: 22,
        y: 22,
        w: 80,
        h: 30
    },
    editMode: false,
    canvas: null,
    context: null,
    buttons: [],

    init(canvas) {
        //retrive if there is local storage of button data

        this.canvas = canvas;
        if (!this.canvas) {
            console.error("Canvas is not defined.");
            return;
        }

        this.context = this.canvas.getContext('2d');
        if (!this.context) {
            console.error("Failed to get 2D context from canvas.");
            return;
        }

        const rect = this.canvas.getBoundingClientRect();

        // Add touch event listeners
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e, rect), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e, rect), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
       this.loadState();
    
    },

    drawSave() {
        const rectX = this.saveButton.x;  
        const rectY = this.saveButton.y;  
        const rectWidth = this.saveButton.w;  
        const rectHeight = this.saveButton.h;  
        const buttonText = "Save";  

        this.context.fillStyle = "#222";  
        this.context.fillRect(rectX, rectY, rectWidth, rectHeight);

        this.context.fillStyle = "#fff";  
        this.context.font = "16px Arial";
        this.context.textAlign = "center";  
        this.context.textBaseline = "middle";  

        const textX = rectX + rectWidth / 2;
        const textY = rectY + rectHeight / 2;

        this.context.fillText(buttonText, textX, textY);
    },

    draw() {
        if (!this.context) {
            console.error("Context is undefined or null.");
            return;
        }
        this.buttons.forEach(button => button.draw(this.context));

        if (this.editMode) {
            this.drawSave();
        }
    },

    add(x, y, r, type, text) {
        const button = new Button(x, y, r, this.canvas, type, text);
        this.buttons.push(button);
        return button;
    },

    handleTouchStart(e, rect) {
        e.preventDefault();
        for (let i = 0; i < e.touches.length; i++) {
            const { clientX, clientY } = e.touches[i];
            const touchX = Math.round(clientX - rect.left);
            const touchY = Math.round(clientY - rect.top);


            if (this.editMode &&
                touchX >= this.saveButton.x && touchX <= this.saveButton.x + this.saveButton.w &&
                touchY >= this.saveButton.y && touchY <= this.saveButton.y + this.saveButton.h) {
                this.saveState();
                return;
            }
// //add if save is touched 
// save the button state in local storege 
// and when refresh  get the data from local storage and apply to the previous state 
            this.buttons.forEach(button => {
                const distanceSquared = (button.x - touchX) ** 2 + (button.y - touchY) ** 2;
                if ((button.type === 'analog' && distanceSquared <= button.R ** 2) ||
                    (button.type === 'button' && distanceSquared <= button.r ** 2)) {
                    button.id = e.touches[i].identifier;
                    button.pressed = true;
                    button.opacity = 0.5;
                }
            });
        }
    },

    handleTouchMove(e, rect) {
        for (let i = 0; i < e.touches.length; i++) {
            const { clientX, clientY, identifier } = e.touches[i];
            const touchX = clientX - rect.left;
            const touchY = clientY - rect.top;
            if (this.editMode) {
                this.buttons.forEach(b => {//save the posioin of button in local storage
                    if (b.type === 'button' && b.pressed) {
                        b.x = touchX;
                        b.y = touchY;
                    } else if (b.type === 'analog' && b.pressed) {
                        b.X = touchX;
                        b.Y = touchY
                        b.x = touchX;
                        b.y = touchY;
                    }
                })
            } else {
                this.buttons.forEach(button => {
                    if (button.id === identifier && button.type === 'analog') {
                        const dx = touchX - button.X; //analog vector
                        const dy = touchY - button.Y;
                        const distanceSquared = dx * dx + dy * dy;
                        const maxDistanceSquared = button.R ** 2;
                        const distance = Math.sqrt(distanceSquared);
                        button.direction.dx = dx / distance;
                        button.direction.dy = dy / distance;

                        
                        if (distanceSquared < maxDistanceSquared) {
                            button.x = touchX;
                            button.y = touchY;
                           
                         
                        } else {
                           
                        
                            button.x = button.X + button.R * button.direction.dx;
                            button.y = button.Y + button.R * button.direction.dy;
                        }
                    }
                });
            }
        }
    },

    handleTouchEnd(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const { identifier } = e.changedTouches[i];

            this.buttons.forEach(button => {
                if (button.id === identifier) {
                    button.pressed = false;
                    button.opacity = 1;
                    if (button.type === 'analog') {
                        button.direction = { dx: 0, dy: 0 };
                        button.x = button.X;
                        button.y = button.Y;
                    }
                    button.id = null;
                }
            });
        }
    },
    saveState() {
        const buttonStates = this.buttons.map(button => ({
            x: button.x,
            y: button.y,
            r: button.r,
            type: button.type,
            text: button.text
        }));
        localStorage.setItem('buttonStates', JSON.stringify(buttonStates));
       console.log('data saved');
    },

    loadState() {
        const savedState = localStorage.getItem('buttonStates');
        if (savedState) {
        
            console.log('data loaded')
            const buttonStates = JSON.parse(savedState);
            //the inilized buttons lenght is larger then dont initate the saved one 
            if(buttonStates.length===this.buttons.length)this.buttons = buttonStates.map(buttonState =>
                new Button(buttonState.x, buttonState.y, buttonState.r, this.canvas, buttonState.type, buttonState.text)
            );
            this.draw();
        }
    }
};
export default controller;