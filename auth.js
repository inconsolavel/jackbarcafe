// auth.js
//
// CORREÇÃO: antes verificava a permissão de admin lendo
// db.collection("usuarios").doc(user.uid) — uma coleção que o resto do
// site nunca usa (index.html/eventos.html gravam em "users"). Ou seja,
// o documento buscado aqui nunca existia, e o admin nunca era reconhecido.
//
// Agora usa exatamente a mesma checagem usada em eventos.html:
// 1) e-mail está na lista ADMIN_EMAILS (definida em firebase-config.js), ou
// 2) o doc em users/{uid} tem isAdmin: true, ou
// 3) existe um doc em admins/{uid}

firebase.auth().onAuthStateChanged(async (user) => {

    if (!user) {
        location.href = "/login.html";
        return;
    }

    const email = (user.email || "").toLowerCase();
    let isAdmin = ADMIN_EMAILS.includes(email);

    if (!isAdmin) {
        const userDoc = await db.collection("users").doc(user.uid).get();
        isAdmin = userDoc.exists && !!userDoc.data().isAdmin;
    }

    if (!isAdmin) {
        const adminDoc = await db.collection("admins").doc(user.uid).get();
        isAdmin = adminDoc.exists;
    }

    if (!isAdmin) {
        alert("Você não possui permissão.");
        location.href = "/";
    }

});
