const BACKEND_URL = "https://dog-vs-cat-classifier-6svj.onrender.com/predict";

const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const preview = document.getElementById("preview");
const predictBtn = document.getElementById("predict-btn");
const result = document.getElementById("result");
const labelEl = document.createElement("h3");
const confidenceText = document.createElement("p");
const confidenceBar = document.getElementById("confidence-bar");
const themeToggle = document.getElementById('theme-toggle');

result.appendChild(labelEl);
result.appendChild(confidenceText);

let selectedFile = null;

// -------------------- Theme Toggle --------------------
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
} else {
    themeToggle.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
});

// -------------------- File Upload --------------------
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.style.borderColor = "#0ea5e9";
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = "#38bdf8";
});

dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.style.borderColor = "#38bdf8";
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', e => handleFile(e.target.files[0]));

// -------------------- Handle File & Preview --------------------
function handleFile(file) {
    if (!file) return;

    selectedFile = file;

    const reader = new FileReader();
    reader.onload = e => {
        preview.src = e.target.result;
        preview.style.display = 'block';

        // Hide drop-zone text when image is loaded
        dropZone.querySelector('p').style.opacity = '0';
    };
    reader.readAsDataURL(file);

    predictBtn.disabled = false;
    result.classList.add('hidden');
}

function clearDropZone() {
    preview.src = '';
    preview.style.display = 'none';
    dropZone.querySelector('p').style.opacity = '1';
    selectedFile = null;
    predictBtn.disabled = true;
    result.classList.add('hidden');
}

// -------------------- Predict --------------------
predictBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    predictBtn.textContent = "Predicting...";
    predictBtn.disabled = true;

    try {
        const res = await fetch("https://dog-vs-cat-classifier-6svj.onrender.com/predict", {
            method: "POST",
            body: formData
        });

        if (!res.ok) throw new Error("Prediction failed");

        const data = await res.json();

        labelEl.textContent = data.prediction;
        confidenceText.textContent = `${data.confidence}% confidence`;

        // Animate confidence bar
        confidenceBar.style.width = '0%';
        setTimeout(() => {
            confidenceBar.style.width = `${data.confidence}%`;
        }, 100);

        result.classList.remove('hidden');
    } catch (err) {
        alert(err);
    } finally {
        predictBtn.textContent = "Predict";
        predictBtn.disabled = false;
    }
});
