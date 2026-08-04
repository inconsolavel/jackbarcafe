async function buscarUsuario() {

    const telefone = document
        .getElementById("telefone")
        .value
        .replace(/\D/g, "");

    const snap = await db
        .collection("users")
        .where("telefone", "==", telefone)
        .limit(1)
        .get();

    if (snap.empty) {

        alert("Usuário não encontrado.");
        return;

    }

    snap.forEach(doc => {

        usuarioSelecionado = doc.id;
        dadosUsuario = doc.data();

    });

    document.getElementById("nome").innerHTML =
        dadosUsuario.nome;

    document.getElementById("tel").innerHTML =
        dadosUsuario.telefone;

    document.getElementById("points").innerHTML =
        dadosUsuario.points;

}
