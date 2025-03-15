document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('airplaneCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;

    // array for airplanes
    const airplanes = [];
    const numAirplanes = 8;

    // smoke trail settings
    const smokeTrailDuration = 2500;
    const smokeSpacing = 20; // pixels between smoke dots

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    function createAirplanes() {
        for (let i = 0; i < numAirplanes; i++) {
            const size = Math.random() * 8 + 3; // random size between 4 and 10
            const speed = Math.random() * 1.5 + 1; // random speed between 1 and 2.5

            const airplane = {
                x: Math.random() * width,
                y: Math.random() * height,
                size: size,
                speed: speed,
                angle: Math.random() * Math.PI * 2, // random angle in radians
                rotationSpeed: (Math.random() - 0.5) * 0.02, // random rotation speed
                smoke: [], // array for smoke trail points
                lastSmokeTime: 0, // time of last smoke dot
                smokeDistance: 0 // distance traveled since last smoke dot
            };

            airplanes.push(airplane);
        }
    }

    // loads the airplane icon
    const airplaneImage = new Image();
    airplaneImage.src = 'airplane.png';

    function drawAirplane(airplane) {
        // ensures icon loaded before drawing
        if (airplaneImage.complete) {
            ctx.save();

            // moves airplane position
            ctx.translate(airplane.x, airplane.y);

            // rotates airplane by 45 degrees (in radians)
            ctx.rotate(airplane.angle + Math.PI / 4);

            // stretches airplane bc icon is weirdly sized
            ctx.scale(2.5, 1.5); // scale X by 2.5 and Y by 1.5

            // draws airplane image (centered and scaled based on airplane size)
            const imgSize = airplane.size * 2; // adjust the size of the icon
            ctx.drawImage(
                airplaneImage,
                -imgSize / 2, // center horizontally
                -imgSize / 2, // center vertically
                imgSize,      // width
                imgSize       // height
            );

            ctx.restore();
        }
    }



    function drawSmokeTrail(airplane) {
        const now = Date.now();

        // draw existing smoke dots
        airplane.smoke.forEach((smoke, index) => {
            const age = now - smoke.time;
            if (age < smokeTrailDuration) {
                // calculate opacity based on age
                const opacity = 1 - (age / smokeTrailDuration);
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.beginPath();
                ctx.arc(smoke.x, smoke.y, smoke.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // remove old smoke dots
                airplane.smoke.splice(index, 1);
            }
        });
    }

    function update() {
        // clear canvas
        ctx.clearRect(0, 0, width, height);

        const now = Date.now();

        // updates and draw each airplane
        airplanes.forEach(airplane => {
            // updates position
            airplane.x += Math.cos(airplane.angle) * airplane.speed;
            airplane.y += Math.sin(airplane.angle) * airplane.speed;

            // updates angle
            airplane.angle += airplane.rotationSpeed;

            // wraps around screen edges
            if (airplane.x < -50) airplane.x = width + 50;
            if (airplane.x > width + 50) airplane.x = -50;
            if (airplane.y < -50) airplane.y = height + 50;
            if (airplane.y > height + 50) airplane.y = -50;

            // updates smoke trail distance
            airplane.smokeDistance += airplane.speed;

            // adds new smoke dot if enough distance has passed
            if (airplane.smokeDistance >= smokeSpacing) {
                airplane.smoke.push({
                    x: airplane.x - Math.cos(airplane.angle) * airplane.size * 1.5,
                    y: airplane.y - Math.sin(airplane.angle) * airplane.size * 1.5,
                    time: now,
                    size: airplane.size / 3
                });
                airplane.smokeDistance = 0;
            }

            // draws smoke trail
            drawSmokeTrail(airplane);

            // draws airplane
            drawAirplane(airplane);
        });

        requestAnimationFrame(update);
    }

    // initializes + starts animation
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    createAirplanes();
    update();
});