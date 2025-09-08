// Create a starry background effect
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        speed: Math.random() * 0.5
    });
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        star.x -= star.speed;
        if (star.x < 0) {
            star.x = canvas.width;
        }
    });
    requestAnimationFrame(animate);
}

animate();

// Add event listener for mouse movement
canvas.addEventListener('mousemove', e => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    // Update star positions based on mouse movement
    stars.forEach(star => {
        const distance = Math.sqrt((star.x - mouseX) ** 2 + (star.y - mouseY) ** 2);
        if (distance < 100) {
            star.speed = 2;
        } else {
            star.speed = 0.5;
        }
    });
});

// Add event listener for scrolling
window.addEventListener('scroll', () => {
    // Update star positions based on scroll position
    stars.forEach(star => {
        star.y += window.scrollY * 0.01;
    });
});
