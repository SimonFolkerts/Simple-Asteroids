window.onload = function () {
  const EL_CANVAS = document.querySelector("#canvas");
  const INTERVAL = 10;

  class GameArea {
    constructor(canvas, interval) {
      this.canvas = canvas;
      this.ctx = this.canvas.getContext("2d");
      this.counter = 0;
      this.interval = interval;
      this.tickInterval = null;
      this.pieces = [];
      this.level = 0;
    }
    start() {
      this.tickInterval = setInterval(this.update.bind(this), this.interval);
    }
    stop() {
      clearInterval(this.tickInterval);
    }
    reset() {
      this.stop();
      this.tickInterval = null;
      this.pieces = [];
      initAsteroids();
    }
    update() {
      this.counter++;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.pieces = this.pieces.filter((piece) => piece.active === true);
      let roids = this.pieces.filter((piece) => piece instanceof Roid);
      if (roids.length <= 0) {
        this.incrementLevel();
      }
      for (let i = 0; i < this.pieces.length; i++) {
        const piece = this.pieces[i];
        if (piece.active) {
          piece.update(keyboardController.keys);
          piece.draw();
        }
      }
    }
    incrementLevel() {
      this.level++;
      this.reset();
    }
  }

  /*
    .######...#######..##.......##.......####.########..########.########.
    ##....##.##.....##.##.......##........##..##.....##.##.......##.....##
    ##.......##.....##.##.......##........##..##.....##.##.......##.....##
    ##.......##.....##.##.......##........##..##.....##.######...########.
    ##.......##.....##.##.......##........##..##.....##.##.......##...##..
    ##....##.##.....##.##.......##........##..##.....##.##.......##....##.
    .######...#######..########.########.####.########..########.##.....##
    */
  class Collider {
    static checkCollision(a, b) {
      if (
        a.x + a.width / 2 > b.x - b.width / 2 &&
        a.x - a.width / 2 < b.x + b.width / 2
      ) {
        if (
          a.y + a.height / 2 > b.y - b.height / 2 &&
          a.y - a.height / 2 < b.y + b.height / 2
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  /*
    ##....##.########.##....##..######.
    ##...##..##........##..##..##....##
    ##..##...##.........####...##......
    #####....######......##.....######.
    ##..##...##..........##..........##
    ##...##..##..........##....##....##
    ##....##.########....##.....######.
    */

  class KeyboardController {
    constructor() {
      this.keys = {
        left: false,
        right: false,
        up: false,
        space: false,
      };
    }
    addListeners(target) {
      target.addEventListener("keydown", this.keyDownEvent.bind(this));
      target.addEventListener("keyup", this.keyUpEvent.bind(this));
    }
    keyDownEvent(event) {
      switch (event.key) {
        case "ArrowLeft":
          this.keys.left = true;
          break;
        case "ArrowRight":
          this.keys.right = true;
          break;
        case "ArrowUp":
          this.keys.up = true;
          break;
        case " ":
          this.keys.space = true;
          break;
      }
    }
    keyUpEvent(event) {
      switch (event.key) {
        case "ArrowLeft":
          this.keys.left = false;
          break;
        case "ArrowRight":
          this.keys.right = false;
          break;
        case "ArrowUp":
          this.keys.up = false;
          break;
        case " ":
          this.keys.space = false;
          break;
      }
    }
  }

  /*
    .######..##.....##.####.########.
    ##....##.##.....##..##..##.....##
    ##.......##.....##..##..##.....##
    .######..#########..##..########.
    ......##.##.....##..##..##.......
    ##....##.##.....##..##..##.......
    .######..##.....##.####.##.......
    */

  class Ship {
    constructor(area) {
      this.active = true;
      area.pieces.push(this);
      this.area = area;
      this.canvas = area.canvas;
      this.ctx = area.ctx;
      this.rotVel = 2;
      this.dx = 0;
      this.dy = 0;
      this.acc = 0.05;
      this.thrust = 0;
      this.x = canvas.width / 2;
      this.y = canvas.height / 2;
      this.angle = 0;
      this.width = 30;
      this.height = 30;
      this.fireRate = 5;
      this.canFire = true;
      this.flikr = 1;
    }
    update(keys) {
      if (keys.space && this.canFire) {
        this.pow();
      }
      if (keys.left) {
        this.angle += -this.rotVel;
      } else if (keys.right) {
        this.angle += this.rotVel;
      }
      //make a joocy vector from angle and increment displacement per tick if thrusting
      if (keys.up) {
        this.thrust = this.acc;
        this.dx += Math.cos(((this.angle - 90) * Math.PI) / 180);
        this.dy += Math.sin(((this.angle - 90) * Math.PI) / 180);
      } else {
        this.thrust = 0;
      }
      this.x += this.dx * this.acc;
      this.y += this.dy * this.acc;

      this.dx *= 0.995;
      this.dy *= 0.995;

      if (this.x < 0) {
        this.x = this.canvas.width;
      } else if (this.x > this.canvas.width) {
        this.x = 0;
      }
      if (this.y < 0) {
        this.y = this.canvas.height;
      } else if (this.y > this.canvas.height) {
        this.y = 0;
      }

      for (let i = 0; i < this.area.pieces.length; i++) {
        let piece = this.area.pieces[i];
        if (piece instanceof Roid === true) {
          if (Collider.checkCollision(this, piece) === true) {
            this.active = false;
            this.area.reset();
            this.area.level = 0;
          }

          // //TEMP
          // let opposite = piece.y - this.y;
          // let adjacent = piece.x - this.x
          // let angleTo = (Math.atan2(opposite, adjacent) * 180 / Math.PI);
          // let hype = Math.sqrt(opposite * opposite + adjacent * adjacent);

          // this.ctx.save();
          // this.ctx.translate(this.x, this.y);
          // //draw shape

          // this.ctx.lineWidth = 2;
          // this.ctx.beginPath();
          // this.ctx.moveTo(0, 0);
          // this.ctx.lineTo(Math.cos(angleTo * Math.PI / 180) * hype, Math.sin(angleTo * Math.PI / 180) * hype);
          // this.ctx.stroke();

          // //return
          // this.ctx.restore();

          // //TEMP
        }
      }
    }
    draw() {
      //prepare for rotation
      this.ctx.save();
      this.ctx.translate(this.x, this.y);
      this.ctx.rotate((this.angle * Math.PI) / 180);
      //draw shape

      this.ctx.strokeStyle = "#FFFFFF";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(0, -this.height / 1.6);
      this.ctx.lineTo(this.width / 2.3, this.height / 2);
      if (this.thrust) {
        if (this.flikr > 0) {
          this.flikr--;
        } else {
          this.flikr = 6;
        }
        this.ctx.lineTo(this.width / 4, this.height / 2);
        this.ctx.lineTo(0, this.height * 1.2 + this.flikr * 1.0);
        this.ctx.lineTo(-this.width / 4, this.height / 2);
        // this.ctx.lineTo(this.width / 4, this.height / 2);
      }
      this.ctx.lineTo(-this.width / 2.3, this.height / 2);
      this.ctx.closePath();
      this.ctx.stroke();

      //return
      this.ctx.restore();
    }
    pow() {
      if (this.canFire) {
        let missile = new Missile(
          this.x,
          this.y,
          this.dx * this.acc,
          this.dy * this.acc,
          this.angle,
          this.area
        );
        this.canFire = false;

        setTimeout(
          function () {
            this.canFire = true;
          }.bind(this),
          (1 / this.fireRate) * 1000
        );
      }
    }
  }

  /*
    ##.....##.####..######...######..####.##.......########
    ###...###..##..##....##.##....##..##..##.......##......
    ####.####..##..##.......##........##..##.......##......
    ##.###.##..##...######...######...##..##.......######..
    ##.....##..##........##.......##..##..##.......##......
    ##.....##..##..##....##.##....##..##..##.......##......
    ##.....##.####..######...######..####.########.########
    */

  class Missile {
    constructor(x, y, dx, dy, angle, area) {
      this.active = true;
      area.pieces.push(this);
      this.area = area;
      this.canvas = area.canvas;
      this.ctx = area.ctx;
      this.x = x;
      this.y = y;
      this.width = 4;
      this.height = 8;
      this.angle = angle;
      this.counter = 0;
      this.vel = 6;
      this.acc = 0.2;
      this.dx = dx + Math.cos(((this.angle - 90) * Math.PI) / 180) * this.vel;
      this.dy = dy + Math.sin(((this.angle - 90) * Math.PI) / 180) * this.vel;
    }
    update() {
      for (let i = 0; i < this.area.pieces.length; i++) {
        let piece = this.area.pieces[i];
        if (piece instanceof Roid === true) {
          if (this.active && Collider.checkCollision(this, piece) === true) {
            this.active = false;
            piece.split();
          }
        }
      }
      this.counter++;
      if (this.counter > 200) {
        this.active = false;
      }
      this.dx += this.acc * Math.cos(((this.angle - 90) * Math.PI) / 180);
      this.dy += this.acc * Math.sin(((this.angle - 90) * Math.PI) / 180);
      this.x += this.dx;
      this.y += this.dy;
      this.height += 0;
    }
    draw() {
      this.ctx.save();
      this.ctx.translate(this.x, this.y);
      this.ctx.rotate((this.angle * Math.PI) / 180);
      this.ctx.strokeStyle = "#FFFFFF";
      this.ctx.lineWidth = this.width;
      this.ctx.beginPath();
      this.ctx.moveTo(0, -this.height / 2);
      this.ctx.lineTo(0, this.height / 2);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      //return
      this.ctx.restore();
    }
  }

  /*
    ########...#######..####.########.
    ##.....##.##.....##..##..##.....##
    ##.....##.##.....##..##..##.....##
    ########..##.....##..##..##.....##
    ##...##...##.....##..##..##.....##
    ##....##..##.....##..##..##.....##
    ##.....##..#######..####.########.
    */

  class Roid {
    constructor(x, y, size, vel, area) {
      this.active = true;
      area.pieces.push(this);
      this.area = area;
      this.canvas = area.canvas;
      this.ctx = area.ctx;
      this.x = x;
      this.y = y;
      this.size = size;
      this.width = size;
      this.height = size;
      this.dx = 0;
      this.dy = 0;
      this.vel = vel;
      this.rotVel = 1;
      this.angle = Math.floor(Math.random() * 360);

      this.minRad = size * 0.8;
      this.maxRad = size * 1.1;
      this.resolution = 10;
      this.xArr = [];
      this.yArr = [];

      for (let i = 0; i < this.resolution; i++) {
        let angle = (360 / this.resolution) * i - 90;
        let x =
          Math.sin((angle * Math.PI) / 180) *
          Math.floor(Math.random() * (this.maxRad - this.minRad) + this.minRad);
        let y =
          Math.cos((angle * Math.PI) / 180) *
          Math.floor(Math.random() * (this.maxRad - this.minRad) + this.minRad);
        this.xArr.push(x);
        this.yArr.push(y);
      }
    }
    split() {
      this.active = false;
      if (this.size > 25) {
        for (let i = 0; i < 2; i++) {
          let newSize = this.size / 2;
          let newX = this.x + Math.floor(Math.random() * 100 - 50);
          let newY = this.y + Math.floor(Math.random() * 100 - 50);
          new Roid(
            newX,
            newY,
            Math.floor((Math.random() * newSize) / 2 + newSize),
            this.vel * 1.2,
            this.area
          );
        }
      }
    }
    update() {
      this.dx = this.vel * Math.cos(((this.angle - 90) * Math.PI) / 180);
      this.dy = this.vel * Math.sin(((this.angle - 90) * Math.PI) / 180);
      this.x += this.dx;
      this.y += this.dy;
      if (this.x < 0) {
        this.x = this.canvas.width;
      } else if (this.x > this.canvas.width) {
        this.x = 0;
      }
      if (this.y < 0) {
        this.y = this.canvas.height;
      } else if (this.y > this.canvas.height) {
        this.y = 0;
      }
    }
    draw() {
      this.ctx.save();
      this.ctx.translate(this.x, this.y);
      this.ctx.rotate((this.angle * Math.PI) / 180);

      this.ctx.fillStyle = "#000000";
      this.ctx.strokeStyle = "#FFFFFF";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(this.xArr[0], this.yArr[0]);
      for (let i = 0; i < this.resolution; i++) {
        this.ctx.lineTo(this.xArr[i], this.yArr[i]);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      //return
      this.ctx.restore();
    }
  }

  function initAsteroids() {
    let ship = new Ship(gameArea);
    let i = 0;
    while (i < 5 + gameArea.level * 3) {
      let roid = new Roid(
        Math.floor(Math.random() * this.canvas.width),
        Math.floor(Math.random() * this.canvas.height),
        Math.floor(Math.random() * 20 + 50),
        0.4,
        gameArea
      );
      if (
        roid.x < gameArea.canvas.width / 3 ||
        roid.x > (gameArea.canvas.width / 3) * 2
      ) {
        if (
          roid.y < gameArea.canvas.height / 3 ||
          roid.y > (gameArea.canvas.height / 3) * 2
        ) {
          i++;
        } else {
          roid.active = false;
        }
      } else {
        roid.active = false;
      }
    }
    gameArea.start();
  }

  gameArea = new GameArea(EL_CANVAS, INTERVAL);
  keyboardController = new KeyboardController();
  keyboardController.addListeners(gameArea.canvas);
  initAsteroids();
};
