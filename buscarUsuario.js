async function buscarUsuario() {

    const telefone = document
        .getElementById("telefone")
        .value
        .replace(/\D/g, "");

    if (!telefone) {
        alert("Digite um telefone para buscar.");
        return;
    }

    let snap;
    try {
        snap = await db
            .collection("users")
            .where("telefone", "==", telefone)
            .limit(1)
            .get();
    } catch (err) {
        console.error("Erro ao buscar usuário:", err);
        alert("Erro ao buscar usuário: " + err.message);
        return;
    }

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
