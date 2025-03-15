document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('networkCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;

    // array for vertices
    let points = [];
    // array for triangles made between nodes
    let Triangles = [];

    const density = 0.0001; // changes # of points created
    const connectionDistance = 190; // maximum distance between points to connect

    // track cursor
    let mouse = {
        x: null,
        y: null,
        radius: 150 // repulsion effect radius
    };

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // recalculate point positions
        initializePoints();
    }

    function initializePoints() {
        points = [];
        Triangles = [];

        const numPoints = Math.floor(width * height * density);

        // create points
        for (let i = 0; i < numPoints; i++) {
            points.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2 + 1,
                vx: Math.random() * 0.5 - 0.15,
                vy: Math.random() * 0.5 - 0.15
            });
        }

        const triangleCount = Math.floor(numPoints * 0.1); // // create triangles between 10% of points
        for (let i = 0; i < triangleCount; i++) {
            // randomly selects 3 points in close proximity
            const randomPoints = [];
            const startPoint = points[Math.floor(Math.random() * points.length)];
            randomPoints.push(startPoint);

            // find nearby points
            const nearbyPoints = points.filter(point => {
                const dx = point.x - startPoint.x;
                const dy = point.y - startPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance < connectionDistance && point !== startPoint;
            });

            // ifenough nearby points exists, create triangle
            if (nearbyPoints.length >= 2) {
                // adds two random nearby points to complete the triangle
                randomPoints.push(nearbyPoints[Math.floor(Math.random() * nearbyPoints.length)]);
                // ensures same point twice not added twuice
                let thirdPoint;
                do {
                    thirdPoint = nearbyPoints[Math.floor(Math.random() * nearbyPoints.length)];
                } while (thirdPoint === randomPoints[1]);
                randomPoints.push(thirdPoint);

                // adds triangle with opacity
                Triangles.push({
                    points: randomPoints,
                    opacity: Math.random() * 0.1 + 0.02 // random opacity between 0.02 and 0.12
                });
            }
        }
    }

    function draw() {
        // clears canvas
        ctx.clearRect(0, 0, width, height);

        // updates point positions
        points.forEach(point => {
            // movement flows
            point.x += point.vx;
            point.y += point.vy;

            // bounces off edge of screen
            if (point.x < 0) {
                point.x = 0;
                point.vx *= -1;
            } else if (point.x > width) {
                point.x = width;
                point.vx *= -1;
            }

            if (point.y < 0) {
                point.y = 0;
                point.vy *= -1;
            } else if (point.y > height) {
                point.y = height;
                point.vy *= -1;
            }

            // cursor repulsion effect
            if (mouse.x !== null && mouse.y !== null) {
                const dx = point.x - mouse.x;
                const dy = point.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    const repelX = Math.cos(angle) * force * 4;
                    const repelY = Math.sin(angle) * force * 4;

                    point.x += repelX;
                    point.y += repelY;
                }
            }
        });

        // draws connections
        drawConnections();

        // draws triangles
        drawTriangles();

        // draws points
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
            ctx.fillStyle = '#aaa';
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }

    function drawConnections() {
        // draws connection between points
        ctx.strokeStyle = 'rgba(180, 180, 180, 0.4)';
        ctx.lineWidth = 0.5;

        points.forEach((pointA, indexA) => {
            points.forEach((pointB, indexB) => {
                if (indexA < indexB) {
                    const dx = pointA.x - pointB.x;
                    const dy = pointA.y - pointB.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        // Draw line between points
                        ctx.beginPath();
                        ctx.moveTo(pointA.x, pointA.y);
                        ctx.lineTo(pointB.x, pointB.y);
                        ctx.stroke();
                    }
                }
            });
        });
    }

    function drawTriangles() {
        Triangles.forEach(triangle => {
            ctx.beginPath();
            ctx.moveTo(triangle.points[0].x, triangle.points[0].y);
            ctx.lineTo(triangle.points[1].x, triangle.points[1].y);
            ctx.lineTo(triangle.points[2].x, triangle.points[2].y);
            ctx.closePath();
            ctx.fillStyle = `rgba(187, 187, 187, ${triangle.opacity})`;
            ctx.fill();
        });
    }

    // tracks cursor movement
    window.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // resets cursor position when cursor leaves
    window.addEventListener('mouseout', function () {
        mouse.x = null;
        mouse.y = null;
    });

    // initializes + start animation
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw();
});