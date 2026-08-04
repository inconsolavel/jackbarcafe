firebase.auth().onAuthStateChanged(async (user) => {

    if (!user) {
        // "/login.html" não existe no site — o login é feito pelo modal
        // na página inicial, então redirecionamos para lá.
        location.href = "/index.html";
        return;
    }

    const doc = await db
        .collection("users")
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
