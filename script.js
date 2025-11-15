const cardsContainer = document.getElementById('cardsContainer');

// Tableau des 40 noms réels
const names = [
  "Alice Dupont","Bob Martin","Claire Durand","David Petit","Emma Lefevre",
  "François Moreau","Géraldine Noel","Hugo Laurent","Isabelle Roux","Julien Caron",
  "Karine Fabre","Louis Marchand","Marie Bertrand","Nicolas Simon","Olivia Thomas",
  "Pauline Garnier","Quentin Bernard","Romain Lemoine","Sophie Millet","Thomas Robin",
  "Ursula Valois","Vincent Leroy","Wendy Hubert","Xavier Gauthier","Yasmine Bellamy",
  "Zacharie Fournier","Amélie Dupuis","Bastien Roy","Camille Mercier","Damien Lefevre",
  "Elodie Blanc","Fabrice Colin","Gaelle Richard","Henriette Proulx","Igor Fontaine",
  "Jessica Pelletier","Kevin Renaud","Laurence Carpentier","Matthieu Denis","Noemie Girard"
];

// Création tableau people avec chemins relatifs pour les images
const people = names.map(name => {
  const safeName = name.replace(/ /g,'_').replace(/[^\w\-]/g,''); 
  return {
    nom: name,
    recto: `images/${safeName}_recto.png`,
    verso: `images/${safeName}_verso.png`,
    qr: `images/${safeName}_qr.png`
  };
});

function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.src = src;
  });
}

// Génération des cartes
people.forEach(person => {
  const wrapper = document.createElement('div');
  wrapper.className = 'card-wrapper';

  wrapper.innerHTML = `
    <div class="card">
      <div class="face front"><img src="${person.recto}" alt="Recto ${person.nom}"></div>
      <div class="face back"><img src="${person.verso}" alt="Verso ${person.nom}"></div>
    </div>
    <div class="controls-card">
      <button class="btn flip">Flip</button>
      <button class="btn download-vertical">Télécharger vertical</button>
      <button class="btn download-pdf">Télécharger PDF</button>
      <img class="qr-code" src="${person.qr}" alt="QR Code ${person.nom}" width="50">
    </div>
  `;

  cardsContainer.appendChild(wrapper);

  const card = wrapper.querySelector('.card');
  const flipBtn = wrapper.querySelector('.flip');
  const downloadVBtn = wrapper.querySelector('.download-vertical');
  const downloadPDFBtn = wrapper.querySelector('.download-pdf');
  const frontImg = card.querySelector('.front img');
  const backImg  = card.querySelector('.back img');
  const qrImg = wrapper.querySelector('.qr-code');

  flipBtn.addEventListener('click', () => card.classList.toggle('flipped'));

  // Swipe mobile
  let startX = 0;
  card.addEventListener('touchstart', e => startX = e.changedTouches[0].screenX);
  card.addEventListener('touchend', e => {
    const endX = e.changedTouches[0].screenX;
    if (Math.abs(endX - startX) > 30) card.classList.toggle('flipped');
  });

  // PNG vertical
  downloadVBtn.addEventListener('click', async () => {
    const [recto, verso] = await Promise.all([loadImage(frontImg.src), loadImage(backImg.src)]);
    const ratio = 5/3;
    const width = 800;
    const height = width / ratio;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(recto, 0, 0, width, height);
    ctx.drawImage(verso, 0, height, width, height);

    canvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${person.nom}_vertical.png`;
      a.click();
    });
  });

  // PDF individuel
  downloadPDFBtn.addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p','pt','a4');

    const [recto, verso] = await Promise.all([loadImage(frontImg.src), loadImage(backImg.src)]);
    const ratio = 5/3;
    const canvasWidth = 800;
    const canvasHeight = 2 * (canvasWidth / ratio);
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // Recto
    ctx.drawImage(recto, 0, 0, canvasWidth, canvasHeight / 2);
    ctx.strokeStyle = "#999999";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0,1); ctx.lineTo(canvasWidth,1); ctx.stroke(); // haut
    ctx.beginPath(); ctx.moveTo(canvasWidth-1,0); ctx.lineTo(canvasWidth-1,canvasHeight/2); ctx.stroke(); // droite
    ctx.beginPath(); ctx.moveTo(1,0); ctx.lineTo(1,canvasHeight/2); ctx.stroke(); // gauche
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0,canvasHeight/2-1); ctx.lineTo(canvasWidth,canvasHeight/2-1); ctx.stroke(); // bas

    // Verso
    ctx.drawImage(verso, 0, canvasHeight / 2, canvasWidth, canvasHeight / 2);
    const versoY = canvasHeight / 2;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0,canvasHeight-1); ctx.lineTo(canvasWidth,canvasHeight-1); ctx.stroke(); // bas
    ctx.beginPath(); ctx.moveTo(canvasWidth-1,versoY); ctx.lineTo(canvasWidth-1,canvasHeight); ctx.stroke(); // droite
    ctx.beginPath(); ctx.moveTo(1,versoY); ctx.lineTo(1,canvasHeight); ctx.stroke(); // gauche

    const imgData = canvas.toDataURL('image/png');

    // Centrage horizontal
    const pdfWidth = 250;
    const pdfHeight = pdfWidth / ratio;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const xOffset = (pageWidth - pdfWidth) / 2;

    pdf.addImage(imgData, 'PNG', xOffset, 20, pdfWidth, pdfHeight * 2);
    pdf.save(`${person.nom}.pdf`);
  });

  // Popup QR
  qrImg.addEventListener('click', () => {
    const qrModal = document.getElementById('qrModal');
    const qrModalImg = document.getElementById('qrModalImg');
    qrModal.style.display = 'flex';
    qrModalImg.src = qrImg.src;
  });
});

// PDF global
const downloadAllPDFBtn = document.getElementById('downloadAllPDF');
downloadAllPDFBtn.addEventListener('click', async () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'pt', 'a4');
  let y = 20;

  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    const [recto, verso] = await Promise.all([loadImage(person.recto), loadImage(person.verso)]);
    const ratio = 5/3;
    const canvasWidth = 800;
    const canvasHeight = 2 * (canvasWidth / ratio);
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // Recto
    ctx.drawImage(recto, 0, 0, canvasWidth, canvasHeight / 2);
    ctx.strokeStyle = "#999999";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0,1); ctx.lineTo(canvasWidth,1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(canvasWidth-1,0); ctx.lineTo(canvasWidth-1,canvasHeight/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1,0); ctx.lineTo(1,canvasHeight/2); ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0,canvasHeight/2-1); ctx.lineTo(canvasWidth,canvasHeight/2-1); ctx.stroke();

    // Verso
    ctx.drawImage(verso, 0, canvasHeight / 2, canvasWidth, canvasHeight / 2);
    const versoY = canvasHeight / 2;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0,canvasHeight-1); ctx.lineTo(canvasWidth,canvasHeight-1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(canvasWidth-1,versoY); ctx.lineTo(canvasWidth-1,canvasHeight); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1,versoY); ctx.lineTo(1,canvasHeight); ctx.stroke();

    const imgData = canvas.toDataURL('image/png');

    const pdfWidth = 250;
    const pdfHeight = pdfWidth / ratio;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const xOffset = (pageWidth - pdfWidth) / 2;

    pdf.addImage(imgData, 'PNG', xOffset, y, pdfWidth, pdfHeight * 2);
    y += pdfHeight * 2 + 20;

    if (i < people.length-1 && y + pdfHeight * 2 > 700) { pdf.addPage(); y = 20; }
  }

  pdf.save('cartes_toutes_personnes.pdf');
});

// Modal QR
const qrModal = document.getElementById('qrModal');
const qrModalImg = document.getElementById('qrModalImg');
const qrModalClose = document.getElementById('qrModalClose');

qrModalClose.addEventListener('click', () => { qrModal.style.display = 'none'; });
qrModal.addEventListener('click', (e) => { if (e.target === qrModal) qrModal.style.display = 'none'; });
