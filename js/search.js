async function initSearch() {

    const input = document.getElementById("searchInput");
    const results = document.getElementById("searchResults");

    if (!input) return;

    const response = await fetch("capsules.json");
    const capsules = await response.json();

    input.addEventListener("input", () => {

        const texte = input.value.toLowerCase().trim();

        results.innerHTML = "";

        if (texte.length < 2) return;

        const trouvees = capsules.filter(c =>
            c.title.toLowerCase().includes(texte)
        );

        trouvees.forEach(capsule => {

            results.innerHTML += `
                <a
                    href="capsule.html?data=${capsule.dataFile}"
                    style="
                        display:flex;
                        align-items:center;
                        gap:15px;
                        background:white;
                        padding:12px;
                        border-radius:18px;
                        text-decoration:none;
                        color:#222;
                        margin-bottom:12px;
                        box-shadow:0 6px 20px rgba(0,0,0,.08);
                    ">

                    <img
                        src="${capsule.thumbnail}"
                        style="
                            width:70px;
                            height:70px;
                            border-radius:14px;
                            object-fit:cover;
                        ">

                    <div>

                        <strong style="font-size:18px;">
                            ${capsule.title}
                        </strong>

                        <br>

                        <span style="color:#666;">
                            ${capsule.levels.join(" • ")}
                        </span>

                    </div>

                </a>
            `;

        });

    });

}

initSearch();