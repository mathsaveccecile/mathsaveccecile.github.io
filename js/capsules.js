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

<a href="capsule.html?data=${capsule.dataFile}">
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
margin:auto;
">
</a>

<h3 style="
margin-top:15px;
font-size:22px;
color:#2738c9;
">
${capsule.title}
</h3>

<div style="
height:14px;
background:#dddddd;
border-radius:999px;
overflow:hidden;
margin-top:12px;
">

<div style="
width:0%;
height:100%;
background:linear-gradient(90deg,#ff4fa3,#3058ff);
"></div>

</div>

<p style="
margin-top:8px;
font-weight:bold;
color:#444;
">
0 %
</p>

</div>
`;
    });
}