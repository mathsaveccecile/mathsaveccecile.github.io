console.log("CAPSULES.JS CHARGÉ");

const SUPABASE_URL = "https://cxzxbvjtkuzfubnsnfhs.supabase.co";
const SUPABASE_KEY = "sb_publishable_eVNeYcTQgFYZ_8t2pHyQ4Q_93ZCmoU1";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function normaliserTexte(texte) {
  return String(texte || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function motsRecherche(capsule) {
  return normaliserTexte([
    capsule.title || "",
    capsule.levels ? capsule.levels.join(" ") : "",
    capsule.keywords ? capsule.keywords.join(" ") : "",
    capsule.dataFile || "",
    capsule.page || ""
  ].join(" "));
}

function synonymesRecherche(recherche) {
  const r = normaliserTexte(recherche);
  const mots = [r];

  const ajouts = {
    "sinus": "trigonometrie trigo cosinus tangente tan triangle rectangle hypoténuse hypotenuse angle",
    "tangente": "trigonometrie trigo sinus cosinus tan triangle rectangle hypoténuse hypotenuse angle",
    "tan": "trigonometrie trigo tangente sinus cosinus triangle rectangle",
    "cosinus": "trigonometrie trigo sinus tangente tan triangle rectangle hypoténuse hypotenuse angle",
    "cos": "trigonometrie trigo cosinus sinus tangente",
    "trigo": "trigonometrie sinus cosinus tangente tan triangle rectangle",
    "trigonometrie": "trigo sinus cosinus tangente tan triangle rectangle",
    "hypotenuse": "hypoténuse pythagore trigonometrie triangle rectangle",
    "hypoténuse": "hypotenuse pythagore trigonometrie triangle rectangle",
    "triangle rectangle": "pythagore trigonometrie hypoténuse hypotenuse cosinus sinus tangente",
    "racine": "pythagore racine carree carré carre",
    "racine carree": "pythagore carré carre",
    "carre": "pythagore racine racine carree",
    "pytagore": "pythagore triangle rectangle hypoténuse hypotenuse",
    "pythagore": "pytagore triangle rectangle hypoténuse hypotenuse racine carré carre",
    "angle": "angles bissectrice rapporteur trigonometrie sinus cosinus tangente",
    "angles": "angle bissectrice rapporteur",
    "bissectrice": "angle angles rapporteur tracer construire",
    "rapporteur": "angle angles mesurer construire bissectrice",
    "parallele": "parallèles paralleles droites",
    "paralleles": "parallèles droites parallele",
    "perpendiculaire": "perpendiculaires droites angle droit equerre",
    "probleme": "modéliser modeliser équation equation raisonnement enonce"
  };

  Object.keys(ajouts).forEach(cle => {
    if (r.includes(normaliserTexte(cle))) {
      mots.push(normaliserTexte(ajouts[cle]));
    }
  });

  return mots.join(" ");
}

function scoreCapsule(capsule, recherche) {
  const r = normaliserTexte(recherche);
  if (!r) return 0;

  const rechercheEtendue = synonymesRecherche(r);
  const texte = motsRecherche(capsule);
  const titre = normaliserTexte(capsule.title || "");
  const keywords = normaliserTexte((capsule.keywords || []).join(" "));

  let score = 0;

  if (titre.includes(r)) score += 100;
  if (keywords.includes(r)) score += 80;
  if (texte.includes(r)) score += 50;

  rechercheEtendue.split(" ").forEach(mot => {
    if (mot.length < 2) return;
    if (titre.includes(mot)) score += 10;
    if (keywords.includes(mot)) score += 8;
    if (texte.includes(mot)) score += 4;
  });

  return score;
}

async function chargerStatsCapsules() {
  const { data: likes } = await supabaseClient
    .from("likes")
    .select("capsule");

  const { data: commentaires } = await supabaseClient
    .from("reviews")
    .select("capsule")
    .eq("published", true);

  const stats = {};

  (likes || []).forEach(like => {
    if (!stats[like.capsule]) stats[like.capsule] = { likes: 0, commentaires: 0 };
    stats[like.capsule].likes++;
  });

  (commentaires || []).forEach(commentaire => {
    if (!stats[commentaire.capsule]) stats[commentaire.capsule] = { likes: 0, commentaires: 0 };
    stats[commentaire.capsule].commentaires++;
  });

  return stats;
}

function creerCarteCapsule(capsule, progressions = [], statsCapsules = {}) {
  const progression = progressions.find(p => p.capsule === capsule.title);
  const percent = progression ? Number(progression.percent || 0) : 0;
  const stats = statsCapsules[capsule.title] || { likes: 0, commentaires: 0 };

  const fillStyle = percent >= 100
    ? "linear-gradient(90deg,#ffd700,#fff8b5,#ffe066,#ffd700)"
    : "linear-gradient(90deg,#ff4fa3,#3058ff)";

  return `
    <div class="card" style="background:none;box-shadow:none;padding:0;max-width:340px;margin:0 auto;">
      <a href="capsule.html?data=${capsule.dataFile}" style="
        display:block;
        position:relative;
        width:260px;
        height:260px;
        margin:auto;
      ">
        <img
          src="${capsule.thumbnail}"
          alt="${capsule.title}"
          style="
            width:260px;
            height:260px;
            object-fit:cover;
            border-radius:25px;
            box-shadow:0 18px 35px rgba(0,0,0,.20);
            display:block;
          ">

        <div style="
          position:absolute;
          left:16px;
          right:16px;
          bottom:34px;
          display:flex;
          justify-content:space-between;
          align-items:center;
          z-index:2;
        ">
          <span style="
            background:#ffffff;
            color:#111111;
            padding:8px 15px;
            border-radius:999px;
            font-size:17px;
            font-weight:900;
            box-shadow:0 6px 14px rgba(0,0,0,.22);
            display:flex;
            align-items:center;
            gap:6px;
          ">
            👍 <span>${stats.likes}</span>
          </span>

          <span style="
            background:#ffffff;
            color:#111111;
            padding:8px 15px;
            border-radius:999px;
            font-size:17px;
            font-weight:900;
            box-shadow:0 6px 14px rgba(0,0,0,.22);
            display:flex;
            align-items:center;
            gap:6px;
          ">
            💬 <span>${stats.commentaires}</span>
          </span>
        </div>

        <div style="
          position:absolute;
          left:14px;
          right:14px;
          bottom:14px;
          height:12px;
          background:rgba(230,230,230,.85);
          border-radius:999px;
          overflow:hidden;
        ">
          <div style="
            width:${percent}%;
            height:100%;
            background:${fillStyle};
            border-radius:999px;
          "></div>
        </div>
      </a>
    </div>
  `;
}

async function chargerProgressions() {
  const { data: sessionData } = await supabaseClient.auth.getSession();
  let progressions = [];

  if (sessionData.session) {
    const { data } = await supabaseClient
      .from("progressions")
      .select("capsule, percent")
      .eq("user_id", sessionData.session.user.id);

    progressions = data || [];
  }

  return progressions;
}
async function chargerCapsules(niveau) {
  const reponse = await fetch("capsules.json?v=" + Date.now());
  const capsules = await reponse.json();
  const progressions = await chargerProgressions();
  const statsCapsules = await chargerStatsCapsules();

  const liste = document.getElementById("listeCapsules");
  liste.innerHTML = "";

  capsules
    .filter(c => Array.isArray(c.levels) && c.levels.includes(niveau))
    .forEach(capsule => {
      liste.innerHTML += creerCarteCapsule(capsule, progressions, statsCapsules);
    });
}

async function activerRechercheCapsules() {
  const input = document.getElementById("searchCapsule");
  const results = document.getElementById("searchResults");

  if (!input || !results) return;

  const reponse = await fetch("capsules.json?v=" + Date.now());
  const capsules = await reponse.json();
  const progressions = await chargerProgressions();
  const statsCapsules = await chargerStatsCapsules();

  function afficherResultats() {
    const recherche = input.value.trim();

    if (!recherche) {
      results.innerHTML = "";
      return;
    }

    const resultats = capsules
      .map(capsule => ({
        capsule,
        score: scoreCapsule(capsule, recherche)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    if (!resultats.length) {
      results.innerHTML = `
        <p style="font-size:22px;color:#555;margin-top:25px;">
          Aucun résultat pour le moment. Essaie un autre mot : Pythagore, sinus, tangente, angle...
        </p>
      `;
      return;
    }

    results.innerHTML = resultats.map(item => {
      const capsule = item.capsule;
      const stats = statsCapsules[capsule.title] || { likes: 0, commentaires: 0 };

      return `
        <a href="capsule.html?data=${capsule.dataFile}" style="
          display:flex;
          align-items:center;
          gap:22px;
          background:white;
          color:#222;
          text-decoration:none;
          border-radius:28px;
          padding:22px;
          margin:22px auto;
          max-width:640px;
          box-shadow:0 18px 40px rgba(0,0,0,.08);
        ">
          <img src="${capsule.thumbnail}" alt="${capsule.title}" style="
            width:110px;
            height:110px;
            object-fit:cover;
            border-radius:22px;
            flex-shrink:0;
          ">

          <div style="text-align:left;">
            <div style="font-size:28px;font-weight:900;line-height:1.2;">
              ${capsule.title}
            </div>

            <div style="font-size:20px;color:#666;margin-top:8px;">
              ${(capsule.levels || []).join(" • ")}
            </div>

            <div style="font-size:20px;font-weight:900;margin-top:10px;color:#333;">
              👍 ${stats.likes} &nbsp;&nbsp; 💬 ${stats.commentaires}
            </div>
          </div>
        </a>
      `;
    }).join("");
  }

  input.addEventListener("input", afficherResultats);
}

document.addEventListener("DOMContentLoaded", () => {
  activerRechercheCapsules();
});