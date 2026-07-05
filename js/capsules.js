async function chargerCapsules(niveau) {

    const reponse = await fetch("capsules.json");
    const capsules = await reponse.json();

    const liste = document.getElementById("listeCapsules");

    liste.innerHTML = "";

    capsules
        .filter(c => c.levels.includes(niveau))
        .forEach(capsule => {

            liste.innerHTML += `
                <div class="card" style="background:none;box-shadow:none;padding:0;">

                    <a href="${capsule.page}">

                        <img
                            src="${capsule.thumbnail}"
                            alt="${capsule.title}"
                            style="
                                width:100%;
                                border-radius:25px;
                                transition:.3s;
                                box-shadow:0 18px 35px rgba(0,0,0,.20);
                                display:block;
                            ">

                    </a>

                </div>
            `;

        });

}