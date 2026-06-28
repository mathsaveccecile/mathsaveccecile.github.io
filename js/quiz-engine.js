const user = {
    connected: false,
    name: ""
};

function isConnected() {
    return user.connected;
}

function login() {
    user.connected = true;
    alert("Connexion réussie !");
    location.reload();
}

function logout() {
    user.connected = false;
    location.reload();
}