const card = document.getElementById('card');
const flipBtn = document.getElementById('flipBtn');
const downloadVerticalBtn = document.getElementById('downloadVertical');
const downloadHorizontalBtn = document.getElementById('downloadHorizontal');
const frontImg = card.querySelector('.front img');
const backImg  = card.querySelector('.back img');

// Flip au clic
flipBtn.addEventListener('click', () => card.classList.toggle('flipped'));

// Swipe mobile
let startX = 0;
card.addEventListener('touchstart', e => startX = e.changedTouches[0].screenX);
card.addEventListener('touchend', e => {
  const endX = e.changedTouches[0].screenX;
  if (Math.abs(endX - startX) > 30) card.classList.toggle('flipped');
});

// Utilitaire pour charger une image
function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // pour éviter les erreurs CORS
    img.onload = () => resolve(img);
    img.src = src;
  });
}

// Téléchargement vertical (recto haut / verso bas)
downloadVerticalBtn.addEventListener('click', async () => {
  const recto = await loadImage(frontImg.src);
  const verso = await loadImage(backImg.src);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(recto.width, verso.width);
  canvas.height = recto.height + verso.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(recto, 0, 0);
  ctx.drawImage(verso, 0, recto.height);

  canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'carte_verticale.png';
    a.click();
  });
});

// Téléchargement horizontal (recto gauche / verso droite)
downloadHorizontalBtn.addEventListener('click', async () => {
  const recto = await loadImage(frontImg.src);
  const verso = await loadImage(backImg.src);

  const canvas = document.createElement('canvas');
  canvas.width = recto.width + verso.width;
  canvas.height = Math.max(recto.height, verso.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(recto, 0, 0);
  ctx.drawImage(verso, recto.width, 0);

  canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'carte_horizontale.png';
    a.click();
  });
});
