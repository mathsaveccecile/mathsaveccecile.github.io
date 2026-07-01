let capsule = {
  title: "",
  level: "",
  duration: "",
  steps: []
};
function moveUp(button) {
  const step = button.parentElement;
  const previous = step.previousElementSibling;

  if (previous) {
    step.parentElement.insertBefore(step, previous);
  }
}

function moveDown(button) {
  const step = button.parentElement;
  const next = step.nextElementSibling;

  if (next) {
    step.parentElement.insertBefore(next, step);
  }
}

document.getElementById("newCapsuleBtn").addEventListener("click", () => {
  document.getElementById("capsuleTitle").value = "";
  document.getElementById("capsuleLevel").value = "";
  document.getElementById("capsuleDuration").value = "";
  document.getElementById("stepsList").innerHTML = "";
  alert("Nouvelle capsule créée !");
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

document.getElementById("openCapsuleBtn").addEventListener("click", async () => {

  const json = await window.api.openCapsule();

  if (!json) return;

  capsule = JSON.parse(json);

  document.getElementById("capsuleTitle").value = capsule.title || "";
  document.getElementById("capsuleLevel").value = capsule.level || "";
  document.getElementById("capsuleDuration").value = capsule.duration || "";

  alert("✅ Capsule chargée !");
});

document.getElementById("addImageBtn").addEventListener("click", async () => {
  const image = await window.api.chooseImage();

  if (!image) return;
  capsule.steps.push({
  type: "image",
  name: image.name,
  src: image.src
});

  document.getElementById("stepsList").innerHTML += `
    <div class="step">
      <button onclick="moveUp(this)">⬆ Monter</button>
      <button onclick="moveDown(this)">⬇ Descendre</button>
      <button onclick="this.parentElement.remove()">🗑️ Supprimer</button>

      <h4>🖼️ Image</h4>
      <img src="${image.src}" style="max-width:300px;border-radius:10px;margin-top:10px;">
      <br>
      <small>${image.name}</small>
    </div>
  `;
});

document.getElementById("addVideoBtn").addEventListener("click", () => {
  const videoStep = {
    type: "video",
    title: "Vidéo YouTube",
    src: ""
  };

  capsule.steps.push(videoStep);

  document.getElementById("stepsList").innerHTML += `
    <div class="step">
      <button onclick="moveUp(this)">⬆ Monter</button>
      <button onclick="moveDown(this)">⬇ Descendre</button>
      <button onclick="this.parentElement.remove()">🗑️ Supprimer</button>

      <h4>🎥 Vidéo YouTube</h4>

      <input 
        placeholder="Colle ici le lien YouTube"
        style="width:90%;padding:12px;border-radius:10px;border:none;font-size:16px;"
        oninput="videoStep.src = this.value"
      >
    </div>
  `;
});

document.getElementById("addPdfBtn").addEventListener("click", () => {
  document.getElementById("stepsList").innerHTML += `
    <div class="step">
      <button onclick="moveUp(this)">⬆ Monter</button>
      <button onclick="moveDown(this)">⬇ Descendre</button>
      <button onclick="this.parentElement.remove()">🗑️ Supprimer</button>
      <h4>📄 PDF</h4>
    </div>
  `;
});

document.getElementById("addQuizBtn").addEventListener("click", () => {
  document.getElementById("stepsList").innerHTML += `
    <div class="step">
      <button onclick="moveUp(this)">⬆ Monter</button>
      <button onclick="moveDown(this)">⬇ Descendre</button>
      <button onclick="this.parentElement.remove()">🗑️ Supprimer</button>
      <h4>❓ Quiz</h4>
    </div>
  `;
});
function download(filename, text) {
  const element = document.createElement("a");

  element.setAttribute(
    "href",
    "data:text/json;charset=utf-8," +
      encodeURIComponent(text)
  );

  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}