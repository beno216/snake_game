





    
      //img
      const appleImg = new Image();
       appleImg.src = "img/apple.png";
      const snake_headImg = new Image();
       snake_headImg.src = "img/snake_head.png";
      //canvas
      const canvas = document.querySelector('canvas');
      const title = document.querySelector('h1');
      const ctx = canvas.getContext('2d');

      //audio
      const audio = document.getElementById('audio');
      const gameOverSound = document.getElementById('gameOverSound');
      audio.volume = 0.1;
      audio.play();

      //Game
      let gameIsRunning = true;
      
      const fps = 10;   
      const titleSize = 30;
      const titleCountX = canvas.width / titleSize;
      const titleCountY = canvas.height / titleSize;
      //const titleCount = titleCountX * titleCountY;
     
      let score = 0;

      //player
      let snakeSpeed = titleSize ;
      let snakePosX = 0;    
      let snakePosY = Math.floor(canvas.height / 2 / titleSize) * titleSize;

      let velocityX = 1;
      let velocityY = 0;

      let tail = [];
      let snakeLength = 4;

      let isPaused = false;


      //food
      let foodPosX = 0;
      let foodPosY = 0;

      let imagesLoaded = 0;

       appleImg.onload = checkImagesLoaded;
       snake_headImg.onload = checkImagesLoaded;

      function checkImagesLoaded() {
      imagesLoaded++;
        if (imagesLoaded === 2) {
        resetFood();
        gameLoop();
          }
        }

        let walls = []; // pole múrov namiesto jedného wallPos

         const wallDuration = 40;
         const wallCooldown = 30;
          let wallTimer = 0;

        


      // Loop
      function gameLoop() {
       if (gameIsRunning) {
         if (!isPaused) {
           moveStuff();
           handleWallTimer();
           }
            drawStuff();
    
            setTimeout(gameLoop, Math.max(1000 / (fps + score), 100));
            }
          }

       /**
        * Move everything
        */
       function moveStuff() {
        // Pohyb hada
          snakePosX += snakeSpeed * velocityX;
          snakePosY += snakeSpeed * velocityY;

        // wrap-around (miznúce múry)
          if (snakePosX >= canvas.width) snakePosX = 0;
          if (snakePosX < 0) snakePosX = canvas.width - titleSize;
          if (snakePosY >= canvas.height) snakePosY = 0;
          if (snakePosY < 0) snakePosY = canvas.height - titleSize;

         // Kolízia s múrom
         for (const wall of walls) {
           if (
             snakePosX < wall.x + wall.w &&
             snakePosX + titleSize > wall.x &&
             snakePosY < wall.y + wall.h &&
             snakePosY + titleSize > wall.y
           ) {
             gameIsRunning = false;
             gameOver();
             return;
           }
         }
  

  // Kolízia so sebou
  tail.forEach((snakePart) => {
    if (snakePosX === snakePart.x && snakePosY === snakePart.y) {
      gameIsRunning = false;
      gameOver();
    }
  });

  // Pridaj novú pozíciu do chvosta
  tail.push({ x: snakePosX, y: snakePosY });

  // Kolízia s jedlom
  if (snakePosX === foodPosX && snakePosY === foodPosY) {
    score++;
    title.textContent = score;
    snakeLength++;
    resetFood();
  }

  // Orezanie chvosta
  tail = tail.slice(-snakeLength);
 }


// Každý múr bude objekt: {x, y, w, h, timer}

function handleWallTimer() {
  wallTimer++;
  if (wallTimer > wallCooldown) {
    // Pridaj nový múr
    const newWall = generateWallObject();
    if (newWall) walls.push(newWall);
    wallTimer = 0;
  }
  // Aktualizuj časovač každého múru a odstráň tie, čo už majú timer > wallDuration
  walls = walls.filter(wall => {
    wall.timer++;
    return wall.timer <= wallDuration;
  });
}

// Vytvor nový múr (vracia objekt alebo null ak sa nepodarí)
function generateWallObject() {
  const minLen = 2;
  const maxLen = 6;
  const wallLen = Math.min(minLen + Math.floor(score / 3), maxLen);
  const maxTries = 100;
  let tries = 0;
  let valid = false;
  let wx, wy, ww, wh;

  while (!valid && tries < maxTries) {
    tries++;
    const horizontal = Math.random() < 0.5;
    if (horizontal) {
      ww = wallLen * titleSize;
      wh = titleSize;
      wx = Math.floor(Math.random() * (titleCountX - wallLen)) * titleSize;
      wy = Math.floor(Math.random() * titleCountY) * titleSize;
    } else {
      ww = titleSize;
      wh = wallLen * titleSize;
      wx = Math.floor(Math.random() * titleCountX) * titleSize;
      wy = Math.floor(Math.random() * (titleCountY - wallLen)) * titleSize;
    }

    // Skontroluj kolíziu s hadom a jedlom
    let collision = false;
    if (
      snakePosX < wx + ww &&
      snakePosX + titleSize > wx &&
      snakePosY < wy + wh &&
      snakePosY + titleSize > wy
    ) collision = true;

    if (!collision) {
      for (const part of tail) {
        if (
          part.x < wx + ww &&
          part.x + titleSize > wx &&
          part.y < wy + wh &&
          part.y + titleSize > wy
        ) {
          collision = true;
          break;
        }
      }
    }
    if (
      !collision &&
      foodPosX < wx + ww &&
      foodPosX + titleSize > wx &&
      foodPosY < wy + wh &&
      foodPosY + titleSize > wy
    ) collision = true;

    if (!collision) valid = true;
  }
  if (valid) return { x: wx, y: wy, w: ww, h: wh, timer: 0 };
  return null;
}




       /**
        * Draw everything
        */

      
       function drawStuff() {
          // background
        rectangle('white', 0, 0, canvas.width, canvas.height);

         //grid
         drawGrid();

         //food
         ctx.drawImage(appleImg, foodPosX, foodPosY, titleSize, titleSize);
       
          // Múr (prekážka)
         // Kreslenie múrov (v drawStuff)
          for (const wall of walls) {
              rectangle("#333", wall.x, wall.y, wall.w, wall.h);
          }     

         //tail
         tail.forEach((snakePart) => {
           rectangle("#7393B3", snakePart.x, snakePart.y, titleSize, titleSize);
         });

         
       // snake head s rotáciou podľa smeru
          ctx.save();
          ctx.translate(snakePosX + titleSize / 2, snakePosY + titleSize / 2);
          let angle = 0;
          if (velocityY === -1) angle = -Math.PI / 2; // hore
          else if (velocityY === 1) angle = Math.PI / 2; // dole
          else if (velocityX === -1) angle = Math.PI; // vlavo
          else if (velocityX === 1) angle = 0; // vpravo
          ctx.rotate(angle);
          ctx.drawImage(snake_headImg, -titleSize / 2, -titleSize / 2, titleSize, titleSize);
          ctx.restore();

         if (isPaused) {
             ctx.fillStyle = "rgba(0,0,0,0.7)";
             ctx.fillRect(0, canvas.height/2 - 40, canvas.width, 80);
             ctx.fillStyle = "#fff";
             ctx.font = "bold 48px sans-serif";
             ctx.textAlign = "center";
             ctx.fillText("PAUSE", canvas.width/2, canvas.height/2 + 15);
}


        }
       
       
          // Draw the rectangle
       function rectangle(colour, x, y, width, height) {
         ctx.fillStyle = colour;
         ctx.fillRect(x, y, width, height);
       }
      

       //Randomize food position
        function resetFood() {
          if(snakeLength === titleCountX * titleCountY) {
            gameIsRunning = false;
            gameOver();
          }
          do {
            foodPosX = Math.floor(Math.random() * titleCountX) * titleSize;
            foodPosY = Math.floor(Math.random() * titleCountY) * titleSize;
          } while (
            (foodPosX === snakePosX && foodPosY === snakePosY) ||
            tail.some((snakePart) => snakePart.x === foodPosX && snakePart.y === foodPosY)
          );
          
        }
        //Game over
        //KEYBORD restart game
        function gameOver() {
          audio.pause();
          audio.currentTime = 0;
          gameOverSound.play();
           title.innerHTML = `
           <img src="https://i.scdn.co/image/ab67616d0000b27324ad87f6af0c9ec809c102e5" alt="game over" style="width:120px;display:block;margin:0 auto 10px;" />
           <strong>${score}</strong><br>Press _ any _ key _ to _ restart
         `;
           gameIsRunning = false;
           }


        /**
         *KEYBOARD
        */
       
       function keyPush(event) {
              if (event.code === "Space") {
                  isPaused = !isPaused;
                    return;
              }
        //if(audio.paused) audio.play();
         switch (event.key) {
           case 'ArrowLeft':
             if (velocityX !== 1) {
               velocityX = -1;
               velocityY = 0;
             }
             break;
           case 'ArrowUp':
             if (velocityY !== 1) {
               velocityX = 0;
               velocityY = -1;
             }
             break;
           case 'ArrowRight':
             if (velocityX !== -1) {
               velocityX = 1;
               velocityY = 0;
             }
             break;
           case 'ArrowDown':
             if (velocityY !== -1) {
               velocityX = 0;
               velocityY = 1;
             }
             break;
             default:
               //restart game
                if (!gameIsRunning) location.reload();
              break;
       }
      
        }
         document.addEventListener("keydown", keyPush);
       //grid
       function drawGrid() {
        for (let i = 0; i < titleCountX; i++) {
          for (let j = 0; j < titleCountY;  j++) {
            rectangle('#000',
            titleSize * i, 
            titleSize * j, 
            titleSize - 1,
            titleSize - 1); 
            }
          }
        }
      
      
      

     