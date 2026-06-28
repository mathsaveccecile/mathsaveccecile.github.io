let user = {
  connected: false,
  name: "",
  email: ""
};

function isConnected() {
  return user.connected;
}

function openLoginModal() {
  const modal = document.createElement("div");
  modal.innerHTML = `
    <div style="
      position:fixed;
      inset:0;
      background:rgba(0,0,0,0.65);
      display:flex;
      align-items:center;
      justify-content:center;
      z-index:9999;
    ">
      <div style="
        background:#261e38;
        color:white;
        padding:35px;
        border-radius:25px;
        width:360px;
        box-shadow:0 20px 60px rgba(0,0,0,0.5);
        font-family:Arial,sans-serif;
      ">
        <h2>Connexion élève</h2>
        <p style="opacity:0.8">Connecte-toi pour garder ta progression et télécharger les fiches.</p>

        <input id="loginEmail" type="email" placeholder="Adresse e-mail" style="
          width:100%;
          padding:14px;
          margin:10px 0;
          border-radius:12px;
          border:none;
          font-size:16px;
        ">

        <input id="loginPassword" type="password" placeholder="Mot de passe" style="
          width:100%;
          padding:14px;
          margin:10px 0 20px 0;
          border-radius:12px;
          border:none;
          font-size:16px;
        ">

        <button onclick="fakeLogin()" style="
          width:100%;
          padding:15px;
          border:none;
          border-radius:999px;
          background:linear-gradient(135deg,#ff4fa3,#3058ff);
          color:white;
          font-weight:900;
          font-size:18px;
          cursor:pointer;
        ">Se connecter</button>

        <button onclick="document.body.removeChild(this.closest('.login-modal'))" style="
          margin-top:12px;
          width:100%;
          padding:12px;
          border:none;
          border-radius:999px;
          background:#555;
          color:white;
          cursor:pointer;
        ">Annuler</button>
      </div>
    </div>
  `;
  modal.className = "login-modal";
  document.body.appendChild(modal);
}

function fakeLogin() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Il faut entrer une adresse e-mail et un mot de passe.");
    return;
  }

  user.connected = true;
  user.email = email;
  localStorage.setItem("mathsAvecCecileUser", JSON.stringify(user));
  location.reload();
}

function loadUser() {
  const savedUser = localStorage.getItem("mathsAvecCecileUser");
  if (savedUser) {
    user = JSON.parse(savedUser);
  }
}

function logout() {
  localStorage.removeItem("mathsAvecCecileUser");
  location.reload();
}

loadUser();