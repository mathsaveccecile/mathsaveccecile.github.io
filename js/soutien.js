document.addEventListener("DOMContentLoaded", () => {
  const supportUrl = "https://buy.stripe.com/6oUbJ04Qc9JH1RfgVo48000";

  if (document.getElementById("soutien-topbar")) return;

  if (!document.getElementById("soutien-style")) {
    const style = document.createElement("style");
    style.id = "soutien-style";
    style.textContent = `
      .soutien-topbar{
        width: 100%;
        display: flex;
        justify-content: flex-end;
        padding: 12px 6% 0 6%;
      }

      .soutien-link{
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        padding: 10px 18px;
        border-radius: 999px;
        font-size: 16px;
        font-weight: 800;
        color: #3058ff;
        background: rgba(255,255,255,0.88);
        border: 2px solid rgba(48,88,255,0.20);
        box-shadow: 0 8px 22px rgba(48,88,255,0.12);
        white-space: nowrap;
        backdrop-filter: blur(6px);
      }

      .soutien-link:hover{
        transform: translateY(-1px);
      }

      @media (max-width: 768px){
        .soutien-topbar{
          justify-content: center;
          padding: 10px 14px 0 14px;
        }

        .soutien-link{
          font-size: 15px;
          padding: 9px 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const barre = document.createElement("div");
  barre.id = "soutien-topbar";
  barre.className = "soutien-topbar";

  const lien = document.createElement("a");
  lien.className = "soutien-link";
  lien.href = supportUrl;
  lien.target = "_blank";
  lien.rel = "noopener noreferrer";
  lien.textContent = "Soutenir 💙";

  barre.appendChild(lien);

  const header = document.querySelector("header");

  if (header) {
    header.insertAdjacentElement("afterend", barre);
  } else {
    document.body.insertAdjacentElement("afterbegin", barre);
  }
});