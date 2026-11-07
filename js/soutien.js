
document.addEventListener("DOMContentLoaded", () => {

  // Lien vers la page de soutien Stripe
  const lienStripe = "https://buy.stripe.com/6oUbJ04Qc9JH1RfgVo48000";

  // Chercher le menu du haut
  const menu = document.querySelector("header nav");

  if (document.querySelector(".bouton-soutien")) return;

  // Créer le bouton
  const bouton = document.createElement("a");
  bouton.href = lienStripe;
  bouton.target = "_blank";
  bouton.rel = "noopener noreferrer";
  bouton.className = "bouton-soutien";
  bouton.textContent = "💙 Soutenir";
  bouton.title = "Contribution libre et facultative";

  if (menu) {
  menu.appendChild(bouton);
} else {
  document.body.prepend(bouton);

  bouton.style.cssText = `
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 1000;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 16px;
    border-radius: 999px;
    background: #e8efff;
    border: 1px solid #bacbff;
    color: #284bc2;
    font: 800 15px Arial, sans-serif;
    text-decoration: none;
    box-shadow: 0 4px 14px rgba(40,75,194,.15);
  `;
}

  // Apparence du bouton
  const style = document.createElement("style");

  style.textContent = `
    header nav a.bouton-soutien {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-left: 18px;
      padding: 11px 18px;
      border-radius: 999px;
      background: #e8efff;
      border: 1px solid #bacbff;
      color: #284bc2;
      font-size: 16px;
      font-weight: 800;
      text-decoration: none;
      white-space: nowrap;
      transition: 0.2s;
    }

    header nav a.bouton-soutien:hover {
      background: #d5e2ff;
      transform: translateY(-2px);
    }

    @media (max-width: 600px) {
      header nav a.bouton-soutien {
        margin: 4px 0;
        padding: 9px 14px;
        font-size: 15px;
      }
    }
  `;

  document.head.appendChild(style);

});
