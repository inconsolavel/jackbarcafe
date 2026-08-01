firebase.auth().onAuthStateChanged(async (user) => {

    if (!user) {
        location.href = "/login.html";
        return;
    }

    const doc = await db
        .collection("usuarios")
        .doc(user.uid)
        .get();

    if (!doc.exists) {
        location.href = "/";
        return;
    }

    if (!doc.data().isAdmin) {
        alert("Você não possui permissão.");
        location.href = "/";
    }

});
