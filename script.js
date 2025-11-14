// script.js

// Récupérer les éléments
const card = document.getElementById('card');
const flipBtn = document.getElementById('flipBtn');
const downloadBtn = document.getElementById('downloadBtn');
const frontFace = card.querySelector('.front');
const backFace = card.querySelector('.back');

// Flip au clic
flipBtn.addEventListener('click', () => card.classList.toggle('flipped'));

// Swipe sur mobile
let startX = 0;
card.addEventListener('touchstart', (e) => {
  startX = e.changedTouches[0].screenX;
});
card.addEventListener('touchend', (e) => {
  const endX = e.changedTouches[0].screenX;
  if (Math.abs(endX - startX) > 30) card.classList.toggle('flipped');
});

// Téléchargement recto + verso horizontal
downloadBtn.addEventListener('click', async () => {
  try {
    // Vérifier que html2canvas est chargé
    if (typeof html2canvas === 'undefined') {
      alert('html2canvas non chargé !');
      return;
    }

    // Capturer les images directement
    const canvasFront = await html2canvas(frontFace.querySelector('img'), { backgroundColor: null, scale: 2 });
    const canvasBack  = await html2canvas(backFace.querySelector('img'), { backgroundColor: null, scale: 2 });

    // Canvas combiné horizontal
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = canvasFront.width + canvasBack.width;
    combinedCanvas.height = Math.max(canvasFront.height, canvasBack.height);
    const ctx = combinedCanvas.getContext('2d');

    ctx.drawImage(canvasFront, 0, 0);                // recto à gauche
    ctx.drawImage(canvasBack, canvasFront.width, 0); // verso à droite

    // Télécharger le PNG combiné
    combinedCanvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'carte_combine_horizontal.png';
      a.click();
    });

  } catch (err) {
    alert('Erreur lors du téléchargement : ' + err);
  }
});
