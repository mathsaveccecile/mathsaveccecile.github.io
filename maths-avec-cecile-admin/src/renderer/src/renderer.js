let capsule = {
  title: "",
  levels: [],
  thumbnail: "",
  thumbnailName: "",
  thumbnailPath: "",
  steps: []
};

function renderCapsule() {
  document.getElementById("capsuleTitle").value = capsule.title || "";

  if (!Array.isArray(capsule.levels)) capsule.levels = [];

  document.querySelectorAll(".levelCheck").forEach(check => {
    check.checked = capsule.levels.includes(check.value);
  });

  const thumbnailPreview = document.getElementById("thumbnailPreview");
  if (thumbnailPreview) {
    thumbnailPreview.innerHTML = capsule.thumbnail
      ? `<img src="${capsule.thumbnail}" style="max-width:260px;border-radius:14px;margin-top:10px;"><br><small>${capsule.thumbnailName || ""}</small>`
      : "<p>Aucune vignette choisie.</p>";
  }

  document.getElementById("stepsList").innerHTML = capsule.steps.map((step, index) => {
    if (step.type === "image") return renderImage(step, index);
    if (step.type === "video") return renderVideo(step, index);
    if (step.type === "pdf") return renderPdf(step, index);
    if (step.type === "quiz") return renderQuiz(step, index);
    return "";
  }).join("");
}

function buttons(index) {
  return `
    <button onclick="moveStepUp(${index})">⬆ Monter</button>
    <button onclick="moveStepDown(${index})">⬇ Descendre</button>
    <button onclick="deleteStep(${index})">🗑️ Supprimer</button>
  `;
}

function renderImage(step, index) {
  return `
    <div class="step">
      ${buttons(index)}
      <h4>🖼️ Image</h4>
      <input value="${step.title || ""}" placeholder="Titre de l'image"
        oninput="updateStepTitle(${index}, this.value)">
      <img src="${step.src}" style="max-width:300px;border-radius:10px;margin-top:10px;">
      <br><small>${step.name || ""}</small>
    </div>
  `;
}

function renderVideo(step, index) {
  return `
    <div class="step">
      ${buttons(index)}
      <h4>🎥 Vidéo YouTube</h4>

      <input value="${step.title || ""}" placeholder="Titre de la vidéo"
        oninput="updateStepTitle(${index}, this.value)">

      <input value="${step.src || ""}" placeholder="Colle ici le lien YouTube"
        oninput="updateVideo(${index}, this.value)">

      <input type="number" value="${step.duration || ""}" placeholder="Durée de la vidéo en secondes"
        oninput="updateVideoDuration(${index}, this.value)">
    </div>
  `;
}

function updateVideoDuration(index, value) {
  capsule.steps[index].duration = Number(value || 0);
}

function renderPdf(step, index) {
  return `
    <div class="step">
      ${buttons(index)}
      <h4>📄 PDF</h4>

      <input value="${step.title || ""}" placeholder="Titre du PDF"
        oninput="updateStepTitle(${index}, this.value)">

      <div style="background:white;color:#222;border-radius:14px;padding:18px;margin-top:12px;max-width:420px;">
        <p><strong>📄 ${step.name || "Fichier PDF"}</strong></p>
        <p>👁️ Visible dans la capsule<br>🔒 Téléchargement réservé aux élèves connectés</p>
      </div>
    </div>
  `;
}

function quizImageBlock(step, index) {
  return `
    <div style="margin:15px 0;padding:15px;background:#2b243b;border-radius:16px;">
      <h4>🖼️ Image du quiz facultative</h4>
      ${step.image ? `
        <img src="${step.image}" style="max-width:260px;border-radius:14px;display:block;margin:10px 0;">
        <button onclick="removeQuizImage(${index})">Supprimer l'image</button>
      ` : `
        <button onclick="chooseQuizImage(${index})">Choisir une image</button>
      `}
    </div>
  `;
}

function renderQuiz(step, index) {
  const type = step.quizType || "qcm";

  if (type === "qcm") {
    const answers = step.answers || ["", "", "", ""];

    return `
      <div class="step">
        ${buttons(index)}
        <h4>📝 QCM</h4>
        ${quizImageBlock(step, index)}

        <input value="${step.question || ""}" placeholder="Question"
          oninput="updateQuizField(${index}, 'question', this.value)">

        ${answers.map((a, i) => `
          <input value="${a || ""}" placeholder="Réponse ${i + 1}"
            oninput="updateQuizAnswer(${index}, ${i}, this.value)">
        `).join("")}

        <label>Bonne réponse :</label>
        <select onchange="updateQuizField(${index}, 'correct', Number(this.value))">
          <option value="0" ${step.correct === 0 ? "selected" : ""}>Réponse 1</option>
          <option value="1" ${step.correct === 1 ? "selected" : ""}>Réponse 2</option>
          <option value="2" ${step.correct === 2 ? "selected" : ""}>Réponse 3</option>
          <option value="3" ${step.correct === 3 ? "selected" : ""}>Réponse 4</option>
        </select>

        <textarea placeholder="Correction / explication"
          oninput="updateQuizField(${index}, 'explanation', this.value)">${step.explanation || ""}</textarea>
      </div>
    `;
  }

  if (type === "open") {
    return `
      <div class="step">
        ${buttons(index)}
        <h4>✍️ Question ouverte</h4>
        ${quizImageBlock(step, index)}

        <textarea placeholder="Question"
          oninput="updateQuizField(${index}, 'question', this.value)">${step.question || ""}</textarea>

        <textarea class="correctionTextarea" placeholder="Réponse attendue / correction"
  oninput="updateQuizField(${index}, 'correction', this.value)">${step.correction || ""}</textarea>
      </div>
    `;
  }

  if (type === "trueFalse") {
    return `
      <div class="step">
        ${buttons(index)}
        <h4>✅❌ Vrai / Faux</h4>
        ${quizImageBlock(step, index)}

        <textarea placeholder="Affirmation"
          oninput="updateQuizField(${index}, 'question', this.value)">${step.question || ""}</textarea>

        <label>Bonne réponse :</label>
        <select onchange="updateQuizField(${index}, 'correct', this.value === 'true')">
          <option value="true" ${step.correct === true ? "selected" : ""}>Vrai</option>
          <option value="false" ${step.correct === false ? "selected" : ""}>Faux</option>
        </select>

    <textarea class="correctionTextarea" placeholder="Correction / explication"
  oninput="updateQuizField(${index}, 'explanation', this.value)">${step.explanation || ""}</textarea>
      </div>
    `;
  }

  if (type === "matching") {
    const pairs = step.pairs || [["", ""], ["", ""], ["", ""], ["", ""]];

    return `
      <div class="step">
        ${buttons(index)}
        <h4>🔗 Associer les paires</h4>
        ${quizImageBlock(step, index)}

        <textarea placeholder="Consigne"
          oninput="updateQuizField(${index}, 'question', this.value)">${step.question || ""}</textarea>

        ${pairs.map((pair, i) => `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <input value="${pair[0] || ""}" placeholder="Élément gauche ${i + 1}"
              oninput="updatePair(${index}, ${i}, 0, this.value)">
            <input value="${pair[1] || ""}" placeholder="Élément droite ${i + 1}"
              oninput="updatePair(${index}, ${i}, 1, this.value)">
          </div>
        `).join("")}

        <textarea placeholder="Correction / explication"
          oninput="updateQuizField(${index}, 'explanation', this.value)">${step.explanation || ""}</textarea>
      </div>
    `;
  }

  return "";
}

async function chooseQuizImage(index) {
  const image = await window.api.chooseImage();
  if (!image) return;

  capsule.steps[index].image = image.src;
  capsule.steps[index].imageName = image.name;
  capsule.steps[index].imagePath = image.path;

  renderCapsule();
}

function removeQuizImage(index) {
  capsule.steps[index].image = "";
  capsule.steps[index].imageName = "";
  capsule.steps[index].imagePath = "";
  renderCapsule();
}

function moveStepUp(index) {
  if (index === 0) return;
  [capsule.steps[index - 1], capsule.steps[index]] = [capsule.steps[index], capsule.steps[index - 1]];
  renderCapsule();
}

function moveStepDown(index) {
  if (index === capsule.steps.length - 1) return;
  [capsule.steps[index + 1], capsule.steps[index]] = [capsule.steps[index], capsule.steps[index + 1]];
  renderCapsule();
}

function deleteStep(index) {
  capsule.steps.splice(index, 1);
  renderCapsule();
}

function updateVideo(index, value) {
  capsule.steps[index].src = value;
}

function updateStepTitle(index, value) {
  capsule.steps[index].title = value;
}

function updateQuizField(index, field, value) {
  capsule.steps[index][field] = value;
}

function updateQuizAnswer(index, answerIndex, value) {
  if (!Array.isArray(capsule.steps[index].answers)) {
    capsule.steps[index].answers = ["", "", "", ""];
  }

  while (capsule.steps[index].answers.length < 4) {
    capsule.steps[index].answers.push("");
  }

  capsule.steps[index].answers[answerIndex] = value;
}

function updatePair(index, pairIndex, side, value) {
  if (!Array.isArray(capsule.steps[index].pairs)) {
    capsule.steps[index].pairs = [["", ""], ["", ""], ["", ""], ["", ""]];
  }

  while (capsule.steps[index].pairs.length < 4) {
    capsule.steps[index].pairs.push(["", ""]);
  }

  capsule.steps[index].pairs[pairIndex][side] = value;
}

function getSelectedLevels() {
  return Array.from(document.querySelectorAll(".levelCheck:checked"))
    .map(check => check.value);
}

document.getElementById("newCapsuleBtn").addEventListener("click", () => {
  capsule = {
    title: "",
    levels: [],
    thumbnail: "",
    thumbnailName: "",
    thumbnailPath: "",
    steps: []
  };
  renderCapsule();
});

document.getElementById("chooseThumbnailBtn").addEventListener("click", async () => {
  const image = await window.api.chooseImage();
  if (!image) return;

  capsule.thumbnail = image.src;
  capsule.thumbnailName = image.name;
  capsule.thumbnailPath = image.path;

  renderCapsule();
});

document.getElementById("saveProjectBtn").addEventListener("click", async () => {
  capsule.title = document.getElementById("capsuleTitle").value;
  capsule.levels = getSelectedLevels();

  if (!capsule.title) {
    alert("Il faut donner un nom à la capsule.");
    return;
  }

  await window.api.saveProject(capsule);
  alert("✅ Projet enregistré !");
});

document.getElementById("openCapsuleBtn").addEventListener("click", async () => {
  const files = await window.api.listCapsules();

  if (!files.length) {
    alert("Aucune capsule enregistrée.");
    return;
  }

  document.getElementById("stepsList").innerHTML = `
    <div class="step">
      <h4>📂 Capsules enregistrées</h4>
      ${files.map(file => `
        <button onclick="openSavedCapsule('${file}')">
          📘 ${file.replace(".json", "")}
        </button>
      `).join("<br><br>")}
    </div>
  `;
});

async function openSavedCapsule(filename) {
  const json = await window.api.openProject(filename);
  capsule = JSON.parse(json);

  if (!Array.isArray(capsule.levels)) {
    capsule.levels = capsule.level ? [capsule.level] : [];
  }

  capsule.thumbnail = capsule.thumbnail || "";
  capsule.thumbnailName = capsule.thumbnailName || "";
  capsule.thumbnailPath = capsule.thumbnailPath || "";
  capsule.steps = capsule.steps || [];

  capsule.steps.forEach(step => {
    if (step.type === "quiz" && step.quizType === "qcm") {
      if (!Array.isArray(step.answers)) step.answers = ["", "", "", ""];
      while (step.answers.length < 4) step.answers.push("");
    }

    if (step.type === "quiz" && step.quizType === "matching") {
      if (!Array.isArray(step.pairs)) step.pairs = [["", ""], ["", ""], ["", ""], ["", ""]];
      while (step.pairs.length < 4) step.pairs.push(["", ""]);
    }
  });

  renderCapsule();
  alert("✅ Capsule ouverte !");
}

document.getElementById("addImageBtn").addEventListener("click", async () => {
  const image = await window.api.chooseImage();
  if (!image) return;

  capsule.steps.push({
    type: "image",
    title: image.name,
    name: image.name,
    path: image.path,
    src: image.src
  });

  renderCapsule();
});

renderCapsule();

document.getElementById("addVideoBtn").addEventListener("click", () => {
  capsule.steps.push({
    type: "video",
    title: "Vidéo YouTube",
    src: "",
    duration: 0
  });

  renderCapsule();
});

document.getElementById("addPdfBtn").addEventListener("click", async () => {
  const pdf = await window.api.choosePdf();
  if (!pdf) return;

  capsule.steps.push({
    type: "pdf",
    title: "Fiche PDF",
    name: pdf.name,
    path: pdf.path,
    src: pdf.src
  });

  renderCapsule();
});

document.getElementById("addQuizBtn").addEventListener("click", () => {
  capsule.steps.push({
    type: "quiz",
    quizType: "qcm",
    title: "QCM",
    question: "",
    answers: ["", "", "", ""],
    correct: 0,
    explanation: "",
    image: ""
  });

  renderCapsule();
});

document.getElementById("addOpenQuizBtn").addEventListener("click", () => {
  capsule.steps.push({
    type: "quiz",
    quizType: "open",
    title: "Question ouverte",
    question: "",
    correction: "",
    image: ""
  });

  renderCapsule();
});

document.getElementById("addTrueFalseQuizBtn").addEventListener("click", () => {
  capsule.steps.push({
    type: "quiz",
    quizType: "trueFalse",
    title: "Vrai / Faux",
    question: "",
    correct: true,
    explanation: "",
    image: ""
  });

  renderCapsule();
});

document.getElementById("addMatchingQuizBtn").addEventListener("click", () => {
  capsule.steps.push({
    type: "quiz",
    quizType: "matching",
    title: "Associer les paires",
    question: "",
    pairs: [["", ""], ["", ""], ["", ""], ["", ""]],
    explanation: "",
    image: ""
  });

  renderCapsule();
});

const previewBtn = document.getElementById("previewCapsuleBtn");
if (previewBtn) {
  previewBtn.addEventListener("click", () => {
    alert("Prévisualisation à faire après. Pour l’instant, l’éditeur est stable.");
  });
}

document.getElementById("exportSiteBtn").addEventListener("click", async () => {
  capsule.title = document.getElementById("capsuleTitle").value;
  capsule.levels = getSelectedLevels();
  capsule.duration = "";

  if (!capsule.title) {
    alert("Il faut donner un nom à la capsule.");
    return;
  }

  const siteData = {
    title: capsule.title,
    levels: capsule.levels || [],
    thumbnail: capsule.thumbnail || "",
    thumbnailName: capsule.thumbnailName || "",
    thumbnailPath: capsule.thumbnailPath || "",
    steps: capsule.steps.map(step => {
      if (step.type === "image") {
        return {
          type: "image",
          title: step.title || step.name || "Image",
          src: step.src
        };
      }

      if (step.type === "video") {
        return {
          type: "video",
          title: step.title || "Vidéo",
          src: step.src || "",
          duration: Number(step.duration || 0)
        };
      }

      if (step.type === "pdf") {
        return {
          type: "pdf",
          title: step.title || step.name || "PDF",
          src: step.src || "",
          loginRequired: true
        };
      }

      if (step.type === "quiz") {
        return {
          type: "quiz",
          quizType: step.quizType || "qcm",
          title: step.title || "QCM",
          question: step.question || "",
          answers: step.answers || [],
          correct: step.correct ?? 0,
          correction: step.correction || "",
          pairs: step.pairs || [],
          explanation: step.quizType === "open" ? "" : (step.explanation || ""),
          image: step.image || "",
          imageName: step.imageName || "",
          imagePath: step.imagePath || ""
        };
      }

      return step;
    })
  };

  try {
    console.log("EXPORT ENVOYÉ :", siteData);
    await window.api.exportSite(siteData);
    alert("✅ Capsule exportée directement sur le site !");
  } catch (error) {
    console.error(error);
    alert("❌ Erreur export : " + error.message);
  }
});

const importBtn = document.getElementById("importSiteBtn");

if (importBtn) {
  importBtn.addEventListener("click", async () => {
    try {
      let text = await window.api.importSite();

      text = text.replace("const capsuleData =", "").trim();

      if (text.endsWith(";")) {
        text = text.slice(0, -1);
      }

      const data = JSON.parse(text);

      if (!Array.isArray(data.levels)) {
        data.levels = data.level ? [data.level] : [];
      }

      capsule = data;

      capsule.thumbnail = capsule.thumbnail || "";
      capsule.thumbnailName = capsule.thumbnailName || "";
      capsule.thumbnailPath = capsule.thumbnailPath || "";
      capsule.steps = capsule.steps || [];

      capsule.steps.forEach(step => {
        if (step.type === "quiz" && step.quizType === "qcm") {
          if (!Array.isArray(step.answers)) step.answers = ["", "", "", ""];
          while (step.answers.length < 4) step.answers.push("");
        }

        if (step.type === "quiz" && step.quizType === "matching") {
          if (!Array.isArray(step.pairs)) step.pairs = [["", ""], ["", ""], ["", ""], ["", ""]];
          while (step.pairs.length < 4) step.pairs.push(["", ""]);
        }
      });

      renderCapsule();

      alert("✅ Capsule importée depuis le site !");
    } catch (e) {
      console.error(e);
      alert("❌ Impossible d'importer la capsule.");
    }
  });
}

document.getElementById("capsuleTitle").addEventListener("input", (e) => {
  capsule.title = e.target.value;
});

document.querySelectorAll(".levelCheck").forEach((check) => {
  check.addEventListener("change", () => {
    capsule.levels = getSelectedLevels();
  });
});

document.addEventListener("mousedown", (e) => {
  const champ = e.target.closest("input, textarea, select");

  if (champ) {
    setTimeout(() => {
      champ.focus();
    }, 0);
  }
}, true);

renderCapsule();