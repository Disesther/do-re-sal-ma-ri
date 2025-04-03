document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('wheel');
    const ctx = canvas.getContext('2d');
    const spinButton = document.getElementById('spinButton');
    const namesInput = document.getElementById('namesInput');
    const resultP = document.getElementById('result');
    
    let names = [];
    let startAngle = 0;
    let arc = 0;
    let isSpinning = false;
    
    // Laad de Salmari fles afbeelding
    const spinnerImage = new Image();
    spinnerImage.src = 'salmari.png';
    let imageLoaded = false;
    
    spinnerImage.onload = () => {
        imageLoaded = true;
        drawWheel();
    };
    
    // Aangepaste kleuren (alleen zwart, rood en wit)
    const colors = [
        '#000000', // Zwart
        '#FF0000', // Rood
    ];

    // Functie om het canvas te schalen op basis van het schermformaat
    function resizeCanvas() {
        const containerWidth = Math.min(window.innerWidth - 40, 600);
        const containerHeight = Math.min(window.innerHeight - 200, 600);
        const size = Math.min(containerWidth, containerHeight);
        
        canvas.width = size;
        canvas.height = size;
        
        drawWheel();
    }
    
    // Luister naar window resize events
    window.addEventListener('resize', resizeCanvas);
    
    // Draw the wheel
    function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Haal de namen uit de input (gescheiden door komma's)
        names = namesInput.value.split(',').map(name => name.trim()).filter(name => name !== '');
        const numNames = names.length;
        
        if (numNames === 0) {
            // Teken een leeg wiel als er geen namen zijn
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 40, 0, 2 * Math.PI);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.stroke();
            drawBottle(0);
            return;
        }
        
        arc = 2 * Math.PI / numNames;
        
        // Teken het wiel iets kleiner om ruimte te maken voor de fles
        const radius = canvas.width / 2 - 40;
        
        for (let i = 0; i < numNames; i++) {
            const angle = i * arc;
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, canvas.height / 2);
            ctx.arc(canvas.width / 2, canvas.height / 2, radius, angle, angle + arc, false);
            ctx.lineTo(canvas.width / 2, canvas.height / 2);
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Voeg de naam toe in het midden van het segment
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(angle + arc / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "white";
            // Pas de tekstgrootte aan op basis van het aantal namen en de grootte van het canvas
            const fontSize = Math.min(20, radius / (numNames / 2));
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.fillText(names[i], radius - 50, 5);
            ctx.restore();
        }
        
        // Teken de fles met glow effect als die aan het draaien is
        if (isSpinning) {
            ctx.save();
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FF0000';
        }
        
        drawBottle(startAngle);
        
        if (isSpinning) {
            ctx.restore();
        }
    }
    
    // Functie om de Salmari fles te tekenen met rotatie
    function drawBottle(rotation) {
        if (!imageLoaded) return;
        
        const bottleWidth = canvas.width * 0.13; // 80/600
        const bottleHeight = canvas.height * 0.4; // 240/600
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        ctx.save();
        // Verplaats naar het midden van de canvas
        ctx.translate(centerX, centerY);
        // Roteer de fles
        ctx.rotate(rotation);
        // Teken de fles
        ctx.drawImage(spinnerImage, 
            -bottleWidth/2,  
            -bottleHeight/2, 
            bottleWidth,     
            bottleHeight     
        );
        ctx.restore();
    }
    
    // Update the wheel when the names change
    namesInput.addEventListener('input', drawWheel);
    namesInput.addEventListener('change', drawWheel);
    
    // Spin the bottle
    function spin() {
        const numNames = names.length;
        if (numNames === 0) {
            alert("Voer eerst enkele namen in!");
            return;
        }
        
        spinButton.disabled = true;
        resultP.textContent = "";
        isSpinning = true;
        
        const spins = Math.floor(Math.random() * 5) + 5;
        const randomAngle = Math.random() * 2 * Math.PI;
        const totalAngle = spins * 2 * Math.PI + randomAngle;
        const duration = 5000;
        const startTime = performance.now();

        function animate(now) {
            const elapsed = now - startTime;
            if (elapsed < duration) {
                const angle = easeOut(elapsed, startAngle, totalAngle, duration);
                startAngle = angle;
                drawWheel();
                requestAnimationFrame(animate);
            } else {
                isSpinning = false;
                startAngle = (startAngle + totalAngle) % (2 * Math.PI);
                drawWheel();
                
                // Nieuwe berekening voor de winnaar
                // De fles wijst naar beneden (Math.PI), dus we moeten de hoek aanpassen
                // zodat de winnaar overeenkomt met waar de hals van de fles naartoe wijst
                const bottleAngle = (startAngle + Math.PI) % (2 * Math.PI);
                const winningIndex = Math.floor(bottleAngle / arc);
                resultP.textContent = "Gekozen: " + names[winningIndex];
                
                spinButton.disabled = false;
            }
        }
        requestAnimationFrame(animate);
    }
    
    function easeOut(t, b, c, d) {
        t /= d;
        return c * (-Math.pow(2, -10 * t) + 1) + b;
    }
    
    spinButton.addEventListener('click', spin);
    
    // Initialiseer het canvas op basis van het schermformaat
    resizeCanvas();
}); 