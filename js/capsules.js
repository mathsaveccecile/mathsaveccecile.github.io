console.log("CAPSULES.JS CHARGÉ");
async function chargerCapsules(niveau) {

    const reponse = await fetch("capsules.json");
    const capsules = await reponse.json();

    const liste = document.getElementById("listeCapsules");

    liste.innerHTML = "";

    capsules
        .filter(c => c.levels.includes(niveau))
        .forEach(capsule => {

            liste.innerHTML += `
                <div class="card" style="background:none;box-shadow:none;padding:0;max-width:340px;margin:0 auto;">

                    <a href="${capsule.page}">

                        <img
                            src="${capsule.thumbnail}"
                            alt="${capsule.title}"
                            style="
  style="
  width:260px;
  height:260px;
  object-fit:cover;
  border-radius:25px;
  box-shadow:0 18px 35px rgba(0,0,0,.20);
  display:block;
">

                    </a>

                </div>
            `;

        });

}