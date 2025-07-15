const imagePairs = [
  { name: 'Add', before: 'images/img0_before.jpg', after: 'images/img0_after.jpg', color: '#548235', text: 'Add a curled fenec fox beneath the shrub' },
  { name: 'Remove', before: 'images/img1_before.jpg', after: 'images/img1_after.jpg', color: '#c00000', text: 'Remove the bicycle' },
  { name: 'Age & Hair', before: 'images/img2_before.jpg', after: 'images/img2_after.jpg', color: '#C55A11', text: 'Make her younger & color her hair black' },
  { name: 'Ambience', before: 'images/img3_before.jpg', after: 'images/img3_after.jpg', color: '#EB9DF8', text: 'Make it dusk & turn the trees into blossoming cherry trees' },
  { name: 'Clothes', before: 'images/img4_before.jpg', after: 'images/img4_after.jpg', color: '#7F6000', text: 'Switch the pullover to a floral cardigan & the long skirt to ankle-length trousers' },
  { name: 'Nature', before: 'images/img5_before.jpg', after: 'images/img5_after.jpg', color: '#A9D18E', text: 'Make it sunrise & alter the robin’s feathers to a shimmering silver' },
  { name: 'Complex', before: 'images/img6_before.jpg', after: 'images/img6_after.jpg', color: '#C73C88', text: 'Place a large glass vase on the floor & delete the fluffy pink cushion' },
  { name: 'Background', before: 'images/img7_before.jpg', after: 'images/img7_after.jpg', color: '#2F5597', text: 'Remove the background' },
  { name: 'Eyes & Emotion', before: 'images/img8_before.jpg', after: 'images/img8_after.jpg', color: '#00B0F0', text: 'Turn her eyes brown & make her smile' },
];

const wrapper = document.getElementById('ba-viewport');
const beforeImg = wrapper.querySelector('.ba__img--before');
const afterImg = wrapper.querySelector('.ba__img--after');
const slider = wrapper.querySelector('.ba__range');
const handle = wrapper.querySelector('.ba__handle');
const pickerBox = document.getElementById('pair-picker');
const caption = document.getElementById('ba-caption');

const bar = wrapper.querySelector('.ba__bar') || (() => {
  const b = document.createElement('div');
  b.className = 'ba__bar';
  wrapper.appendChild(b);
  return b;
})();

const rendered = { width: 0, offsetX: 0 };
const dynamicStyle = document.createElement('style');
document.head.appendChild(dynamicStyle);

const updateSliderGeometry = () => {
  const containerWidth = wrapper.clientWidth;
  const containerHeight = wrapper.clientHeight;
  if (containerWidth === 0 || afterImg.naturalWidth === 0) return;
  const imgRatio = afterImg.naturalWidth / afterImg.naturalHeight;
  const containerRatio = containerWidth / containerHeight;
  if (imgRatio > containerRatio) {
    rendered.width = containerWidth;
    rendered.offsetX = 0;
  } else {
    rendered.width = containerHeight * imgRatio;
    rendered.offsetX = (containerWidth - rendered.width) / 2;
  }
  slider.style.width = `${rendered.width}px`;
  slider.style.left = `${rendered.offsetX}px`;
  const startPct = (rendered.offsetX / containerWidth) * 100;
  const midPct = ((rendered.offsetX + rendered.width * 0.8) / containerWidth) * 100;
  const endPct = ((rendered.offsetX + rendered.width * 0.5) / containerWidth) * 100;
  dynamicStyle.innerHTML = `
    @keyframes barIntro {
      0%   { left: ${startPct}%; }
      50%  { left: ${midPct}%; }
      100% { left: ${endPct}%; }
    }
    @keyframes clipIntro {
      0%   { clip-path: inset(0 ${100 - startPct}% 0 0); }
      50%  { clip-path: inset(0 ${100 - midPct}% 0 0); }
      100% { clip-path: inset(0 ${100 - endPct}% 0 0); }
    }
  `;
};

const setPos = pct => {
  pct = Math.max(0, Math.min(100, pct));
  const handlePx = rendered.offsetX + (pct / 100) * rendered.width;
  const handlePct = wrapper.clientWidth > 0 ? (handlePx / wrapper.clientWidth) * 100 : 0;
  beforeImg.style.clipPath = `inset(0 calc(100% - ${handlePct}%) 0 0)`;
  handle.style.left = bar.style.left = `${handlePct}%`;
  slider.value = pct;
};

window.addEventListener('resize', () => {
  updateSliderGeometry();
  setPos(+slider.value);
});

wrapper.addEventListener('click', e => {
  if (rendered.width === 0) return;
  const rect = wrapper.getBoundingClientRect();
  const clickX = e.clientX - (rect.left + rendered.offsetX);
  const newPct = (clickX / rendered.width) * 100;
  setPos(newPct);
});

slider.addEventListener('input', () => setPos(+slider.value));
wrapper.addEventListener('animationend', () => wrapper.classList.remove('animate'));

const preloadImagePairs = () => {
  imagePairs.forEach(pair => {
    const imgBefore = new Image();
    const imgAfter = new Image();
    imgBefore.src = pair.before;
    imgAfter.src = pair.after;
  });
};

preloadImagePairs();

imagePairs.forEach((pair, idx) => {
  const btn = document.createElement('button');
  btn.className = 'ba-picker__button';
  btn.textContent = pair.name;
  btn.style.setProperty('--btn-col', pair.color);
  if (idx === 0) btn.classList.add('is-active');
  btn.addEventListener('click', () => {
    if (btn.classList.contains('is-active')) return;
    pickerBox.querySelectorAll('button').forEach(b => b.classList.toggle('is-active', b === btn));
    beforeImg.src = pair.before;
    afterImg.src = pair.after;
    beforeImg.alt = `${pair.name} – before`;
    afterImg.alt = `${pair.name} – after`;
    caption.textContent = pair.text;
    caption.classList.remove('animate');
    void caption.offsetWidth;
    caption.classList.add('animate');
    caption.style.opacity = '1';
    const onNewImageLoad = () => {
      updateSliderGeometry();
      wrapper.classList.remove('animate');
      void wrapper.offsetWidth;
      wrapper.classList.add('animate');
      setPos(50);
    };
    if (afterImg.complete) {
      onNewImageLoad();
    } else {
      afterImg.addEventListener('load', onNewImageLoad, { once: true });
    }
  });
  pickerBox.appendChild(btn);
});

const initializeSlider = () => {
  updateSliderGeometry();
  setPos(50);
  caption.textContent = imagePairs[0].text;
  caption.style.opacity = '1';
};

if (afterImg.complete) {
  initializeSlider();
} else {
  afterImg.addEventListener('load', initializeSlider, { once: true });
}


/* ======================= COLLAGE VIEWER ====================== */

const collageItems = [
    { name: 'Add', image: 'images/collages/add.jpg', color: '#548235' },
    { name: 'Change', image: 'images/collages/chg.jpg', color: '#FFC000' },
    { name: 'Change Material', image: 'images/collages/chg_mat.jpg', color: '#00B0F0' },
    { name: 'Remove', image: 'images/collages/rem.jpg', color: '#c00000' },
    { name: 'Clothes', image: 'images/collages/clothes.jpg', color: '#7F6000' },
    { name: 'Age & Physique', image: 'images/collages/age_phys.jpg', color: '#7030A0' },
    { name: 'Hair', image: 'images/collages/hair.jpg', color: '#181717' },
    { name: 'Human Accessory', image: 'images/collages/accessory.jpg', color: '#C55A11' },
    { name: 'Composite', image: 'images/collages/composite.jpg', color: '#C73C88' },
    { name: 'Time, Weather, Seasons', image: 'images/collages/time.jpg', color: '#EB9DF8' },
    { name: 'Background', image: 'images/collages/bg.jpg', color: '#2F5597' },
    { name: 'Repair', image: 'images/collages/repair.jpg', color: '#A9D18E' },
];

const collagePicker = document.getElementById('collage-picker');
const collageImage = document.getElementById('collage-image');

const preloadCollageImages = () => {
    collageItems.forEach(item => {
        const img = new Image();
        img.src = item.image;
    });
};

if (collagePicker && collageImage) {
    preloadCollageImages();
    // 1. Build buttons
    collageItems.forEach((item, idx) => {
        const btn = document.createElement('button');
        btn.className = 'ba-picker__button';
        btn.textContent = item.name;
        btn.style.setProperty('--btn-col', item.color);
        if (idx === 0) {
            btn.classList.add('is-active');
        }

        // 2. Add click listener
        btn.addEventListener('click', () => {
            if (btn.classList.contains('is-active')) return;

            collagePicker.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');

            collageImage.classList.add('fade-out');

            // setTimeout(() => {
            collageImage.src = item.image;
            collageImage.alt = `Collage of ${item.name}`;
            collageImage.classList.remove('fade-out');
            // }, 200);
        });

        collagePicker.appendChild(btn);
    });

    // 3. Set initial image
    if (collageItems.length > 0) {
        collageImage.src = collageItems[0].image;
        collageImage.alt = `Collage of ${collageItems[0].name}`;
    }
}