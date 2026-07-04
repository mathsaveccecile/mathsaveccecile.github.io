let capsule = {
  title: "",
  level: "",
  duration: "",
  steps: []
};

function renderCapsule() {
  document.getElementById("capsuleTitle").value = capsule.title || "";
  document.getElementById("capsuleLevel").value = capsule.level || "";
  document.getElementById("capsuleDuration").value = capsule.duration || "";

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

      <input
        value="${step.title || ""}"
        placeholder="Titre de l'image"
        oninput="updateStepTitle(${index}, this.value)"
        style="width:90%;padding:12px;border-radius:10px;border:none;font-size:16px;margin-bottom:10px;"
      >

      <img src="${step.src}" style="max-width:300px;border-radius:10px;margin-top:10px;">

      <br>

      <small>${step.name || ""}</small>

    </div>
  `;
}

function renderVideo(step, index) {
  return `
    <div class="step">
      ${buttons(index)}
      <h4>🎥 Vidéo YouTube</h4>

      <input
        value="${step.title || ""}"
        placeholder="Titre de la vidéo"
        oninput="updateStepTitle(${index}, this.value)"
        style="width:90%;padding:12px;border-radius:10px;border:none;font-size:16px;margin-bottom:10px;"
      >

      <input 
        value="${step.src || ""}"
        placeholder="Colle ici le lien YouTube"
        oninput="updateVideo(${index}, this.value)"
        style="width:90%;padding:12px;border-radius:10px;border:none;font-size:16px;margin-bottom:10px;"
      >

      <input
        type="number"
        value="${step.duration || ""}"
        placeholder="Durée en secondes"
        oninput="updateStepDuration(${index}, this.value)"
        style="width:90%;padding:12px;border-radius:10px;border:none;font-size:16px;"
      >
    </div>
  `;
}

function renderPdf(step, index) {
  return `
    <div class="step">
      ${buttons(index)}
      <h4>📄 PDF</h4>
      <div style="background:white;color:#222;border-radius:14px;padding:18px;margin-top:12px;max-width:420px;">
        <p><strong>📄 ${step.name || "Fichier PDF"}</strong></p>
        <p>👁️ Visible dans la capsule<br>🔒 Téléchargement réservé aux élèves connectés</p>
      </div>
    </div>
  `;
}

function renderQuiz(step, index) {
  return `
    <div class="step">
      ${buttons(index)}
      <h4>❓ Quiz</h4>
    </div>
  `;
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

function updateStepDuration(index, value) {
  capsule.steps[index].duration = Number(value);
}
document.getElementById("newCapsuleBtn").addEventListener("click", () => {
  capsule = { title: "", level: "", duration: "", steps: [] };
  renderCapsule();
});

document.getElementById("saveCapsuleBtn").addEventListener("click", () => {
  capsule.title = document.getElementById("capsuleTitle").value;
  capsule.level = document.getElementById("capsuleLevel").value;
  capsule.duration = document.getElementById("capsuleDuration").value;

  if (!capsule.title) {
    alert("Il faut donner un nom à la capsule.");
    return;
  }

  const json = JSON.stringify(capsule, null, 2);
  const filename = capsule.title.replaceAll(" ", "_") + ".json";
  download(filename, json);
});

document.getElementById("saveProjectBtn").addEventListener("click", async () => {
  capsule.title = document.getElementById("capsuleTitle").value;
  capsule.level = document.getElementById("capsuleLevel").value;
  capsule.duration = document.getElementById("capsuleDuration").value;

  if (!capsule.title) {
    alert("Il faut donner un nom à la capsule.");
    return;
  }

  await window.api.saveProject(capsule);

  alert("✅ Projet enregistré dans le dossier capsules !");
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
  src: image.src
});

  renderCapsule();
});

document.getElementById("addVideoBtn").addEventListener("click", () => {
  capsule.steps.push({
    type: "video",
    title: "Vidéo YouTube",
    src: ""
  });

  renderCapsule();
});

document.getElementById("addPdfBtn").addEventListener("click", async () => {
  const pdf = await window.api.choosePdf();
  if (!pdf) return;

  capsule.steps.push({
    type: "pdf",
    title: "PDF",
    name: pdf.name,
    path: pdf.path,
    src: pdf.src
  });

  renderCapsule();
});

document.getElementById("addQuizBtn").addEventListener("click", () => {
  capsule.steps.push({
    type: "quiz",
    title: "Quiz"
  });

  renderCapsule();
});

document.getElementById("previewCapsuleBtn").addEventListener("click", () => {
  alert("Prévisualisation à faire après. Pour l’instant, l’éditeur est stable.");
});

document.getElementById("exportSiteBtn").addEventListener("click", async () => {
  capsule.title = document.getElementById("capsuleTitle").value;
  capsule.level = document.getElementById("capsuleLevel").value;
  capsule.duration = document.getElementById("capsuleDuration").value;

  if (!capsule.title) {
    alert("Il faut donner un nom à la capsule.");
    return;
  }

  const siteData = {
    title: capsule.title,
    levels: capsule.level,
    duration: capsule.duration,
    steps: capsule.steps.map((step) => {
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
          title: step.name || "PDF",
          src: step.src || "",
          loginRequired: true
        };
      }

      if (step.type === "quiz") {
        return {
          type: "quiz",
          quizType: "qcm",
          title: step.title || "Quiz",
          question: "Question à compléter",
          answers: ["Réponse 1", "Réponse 2", "Réponse 3"],
          correctAnswer: "Réponse 1"
        };
      }

      return step;
    })
  };

  await window.api.exportSite(siteData);

alert("✅ Capsule exportée directement sur le site !");
});

function download(filename, text) {
  const element = document.createElement("a");
  element.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(text));
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
document.getElementById("importSiteBtn").addEventListener("click", async () => {
  try {
    let text = await window.api.importSite();

    text = text.replace("const capsuleData =", "").trim();

    if (text.endsWith(";")) {
      text = text.slice(0, -1);
    }

    const data = JSON.parse(text);

    if (data.levels) {
      data.level = data.levels;
      delete data.levels;
    }

    capsule = data;

    renderCapsule();

    alert("✅ Capsule importée depuis le site !");
  } catch (e) {
    console.error(e);
    alert("❌ Impossible d'importer la capsule.");
  }
});
renderCapsule();