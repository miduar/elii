window.addEventListener('load', () => {

    const container = document.getElementById('heart-container');
    const svgPath = document.getElementById('heart-path');
    const counterElement = document.getElementById('counter');
    const resetButton = document.getElementById('reset-button');
    const hintButton = document.getElementById('hint-button');
    const finalModal = document.getElementById('final-modal');
    const closeModalButton = document.querySelector('.close-button');

    if (!container || !svgPath || !counterElement || !hintButton || !finalModal || !closeModalButton) {
        console.error("No se encontraron uno o más de los elementos necesarios.");
        return;
    }

    // MODIFICAR: Todo el contenido de texto se personaliza aquí.
    const config = {
        titulo: "10 cosas que me encantan de ti Elii",
        instrucciones: "Haz clic en los corazones para descubrir los mensajes.",
        // MODIFICAR: Escribe aquí las 10 frases que quieres que aparezcan.
        frases: [
            "Tu increíble sentido del humor", "La forma en que iluminas un lugar",
            "Tu corazón generoso y amable", "Tu energía y alegría contagiosas",
            "La pasión con la que persigues tus sueños", "Lo inteligente y brillante que eres",
            "Tu sonrisa, que es mi favorita :3", "Tu fortaleza y valentía ante todo",
            "tus  hermosos ojos :3", "Simplemente, que seas tú"
        ],
        // MODIFICAR: Título y párrafo del mensaje final.
        mensajeFinal: {
            titulo: "¡Me encantas!",
            parrafo: "Y lo más importante: ¡Te quiero muchísimo! Gracias por ser como eres.(dame chanse jsj)"
        }
    };

    // MODIFICAR: Número total de corazones que se generan.
    const TOTAL_HEARTS = 80;
    // MODIFICAR: Rango de tamaño de los corazones (mínimo y máximo).
    const MIN_SIZE = 10;
    const MAX_SIZE = 35;
    // MODIFICAR: Paleta de colores para los corazones.
    const COLORS = ['#e74c3c', '#c0392b', '#ff7979', '#ff4d4d', '#f19066', '#d63031', '#e84393'];
    // NOTA: Este número debe coincidir con la cantidad de frases en el array 'config.frases'.
    const SPECIAL_HEART_COUNT = 10;

    let placedHearts = [];
    let shuffledPhrases = [];
    let specialHeartsCreated = 0;
    let discoveredCount = 0;
    let scale = 1;

    function initGame() {

        const viewBoxWidth = 500;
        const containerWidth = container.clientWidth;
        scale = containerWidth / viewBoxWidth;

        discoveredCount = 0;
        specialHeartsCreated = 0;
        counterElement.textContent = `0 / ${SPECIAL_HEART_COUNT}`;
        finalModal.style.display = 'none';
        resetButton.style.display = 'none';
        shuffledPhrases = [...config.frases].sort(() => 0.5 - Math.random());

        generateHearts();
    }

    function createHeart(x, y, size) {
        const heart = document.createElement('div');
        heart.classList.add('small-heart');

        const rotation = Math.random() * 90 - 45;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];

        const scaledSize = size * scale;
        const scaledX = x * scale;
        const scaledY = y * scale;

        heart.style.setProperty('--heart-color', color);
        heart.style.width = `${scaledSize}px`;
        heart.style.height = `${scaledSize}px`;
        heart.style.left = `${scaledX - scaledSize / 2}px`;
        heart.style.top = `${scaledY - scaledSize / 2}px`;
        heart.style.transform = `rotate(${-45 + rotation}deg)`;

        if (specialHeartsCreated < SPECIAL_HEART_COUNT && Math.random() > 0.5) {
            heart.classList.add('special-heart');
            heart.dataset.phrase = shuffledPhrases[specialHeartsCreated];
            specialHeartsCreated++;
        }

        container.appendChild(heart);
    }

    function isColliding(newHeart) {
        for (const placed of placedHearts) {
            const dx = newHeart.x - placed.x;
            const dy = newHeart.y - placed.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = ((newHeart.size / 1.2) + (placed.size / 1.2));
            if (distance < minDistance) return true;
        }
        return false;
    }

    function generateHearts() {
        const existingHearts = container.querySelectorAll('.small-heart');
        existingHearts.forEach(heart => heart.remove());
        placedHearts = [];

        const svg = svgPath.ownerSVGElement;
        const pathBox = svgPath.getBBox();
        if (pathBox.width === 0 || pathBox.height === 0) {
            console.error("Error: Las dimensiones del SVG son 0.");
            return;
        }

        let heartsPlaced = 0;
        let attempts = 0;
        const MAX_ATTEMPTS = TOTAL_HEARTS * 150;

        while (heartsPlaced < TOTAL_HEARTS && attempts < MAX_ATTEMPTS) {
            attempts++;
            const randomSize = Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE;
            const randomX = pathBox.x + Math.random() * pathBox.width;
            const randomY = pathBox.y + Math.random() * pathBox.height;
            const point = svg.createSVGPoint();
            point.x = randomX;
            point.y = randomY;

            if (svgPath.isPointInFill(point)) {
                const newHeart = { x: randomX, y: randomY, size: randomSize };
                if (!isColliding(newHeart)) {
                    createHeart(newHeart.x, newHeart.y, newHeart.size);
                    placedHearts.push(newHeart);
                    heartsPlaced++;
                }
            }
        }
        if (attempts >= MAX_ATTEMPTS) {
            console.warn(`Máximo de intentos. Corazones: ${heartsPlaced}/${TOTAL_HEARTS}`);
        }
    }

    function showPhrase(event) {
        const clickedHeart = event.target.closest('.special-heart');
        if (!clickedHeart || clickedHeart.classList.contains('is-active')) return;

        if (!clickedHeart.classList.contains('discovered')) {
            clickedHeart.classList.add('discovered', 'is-active');
            clickedHeart.classList.remove('heart-beat');
            discoveredCount++;
            counterElement.textContent = `${discoveredCount} / ${SPECIAL_HEART_COUNT}`;
            counterElement.parentElement.classList.add('updated');
            setTimeout(() => counterElement.parentElement.classList.remove('updated'), 400);

            if (discoveredCount === SPECIAL_HEART_COUNT) {
                setTimeout(() => {
                    finalModal.style.display = 'flex';
                    resetButton.style.display = 'inline-block';
                    // MODIFICAR: Propiedades del confeti (cantidad, dispersión, etc.).
                    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
                }, 3100);
            }
        } else {
            clickedHeart.classList.add('is-active');
        }

        const phrase = clickedHeart.dataset.phrase;
        const phrasePopup = document.createElement('div');
        phrasePopup.classList.add('phrase-popup');
        phrasePopup.textContent = phrase;

        const heartRect = clickedHeart.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        phrasePopup.style.left = `${heartRect.left - containerRect.left + heartRect.width / 2}px`;
        phrasePopup.style.top = `${heartRect.top - containerRect.top}px`;
        container.appendChild(phrasePopup);

        setTimeout(() => {
            phrasePopup.remove();
            clickedHeart.classList.remove('is-active');
        }, 3000);
    }

    function showHint() {
        document.querySelectorAll('.special-heart:not(.discovered)').forEach(heart => {
            heart.classList.add('heart-beat');
            setTimeout(() => heart.classList.remove('heart-beat'), 4000);
        });
    }

    function closeModal() {
        finalModal.style.display = 'none';
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    document.querySelector('h1').textContent = config.titulo;
    document.querySelector('.instructions').textContent = config.instrucciones;
    document.querySelector('#final-modal h2').textContent = config.mensajeFinal.titulo;
    document.querySelector('#final-modal p').textContent = config.mensajeFinal.parrafo;

    initGame();

    container.addEventListener('click', showPhrase);
    hintButton.addEventListener('click', showHint);
    resetButton.addEventListener('click', initGame);
    closeModalButton.addEventListener('click', closeModal);
    finalModal.addEventListener('click', (event) => {
        if (event.target === finalModal) closeModal();
    });

    window.addEventListener('resize', debounce(initGame, 250));

});
