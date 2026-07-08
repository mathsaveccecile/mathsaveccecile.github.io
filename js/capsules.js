console.log("CAPSULES.JS CHARGÉ");

const SUPABASE_URL = "https://cxzxbvjtkuzfubnsnfhs.supabase.co";
const SUPABASE_KEY = "sb_publishable_eVNeYcTQgFYZ_8t2pHyQ4Q_93ZCmoU1";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function chargerCapsules(niveau) {
  const reponse = await fetch("capsules.json");
  const capsules = await reponse.json();

  const { data: sessionData } = await supabaseClient.auth.getSession();
  let progressions = [];

  if (sessionData.session) {
    const { data } = await supabaseClient
      .from("progressions")
      .select("capsule, percent")
      .eq("user_id", sessionData.session.user.id);

    progressions = data || [];
  }

  const liste = document.getElementById("listeCapsules");
  liste.innerHTML = "";

  capsules
    .filter(c => c.levels.includes(niveau))
    .forEach(capsule => {
      const progression = progressions.find(p => p.capsule === capsule.title);
      const percent = progression ? Number(progression.percent || 0) : 0;

      const fillStyle = percent >= 100
        ? "linear-gradient(90deg,#ffd700,#fff8b5,#ffe066,#ffd700)"
        : "linear-gradient(90deg,#ff4fa3,#3058ff)";

      liste.innerHTML += `
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
    });
}