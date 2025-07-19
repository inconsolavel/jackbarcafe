function startQrScanner(uid) {
  const qr = new Html5Qrcode('reader');
  let scanned = false;

  qr.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: 250 },
    async (data) => {
      if (!scanned) {
        scanned = true;
        try {
          const pontos = Number(data);
          if (isNaN(pontos) || pontos <= 0) {
            alert("QR Code inválido.");
            return;
          }

          const qrRef = db.collection('used_qrcodes').doc(data);
          const qrDoc = await qrRef.get();
          if (qrDoc.exists) {
            alert("Este QR Code já foi usado.");
          } else {
            await qrRef.set({ uid: uid, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
            await addPoints(uid, pontos);
            alert(`+${pontos} ponto(s) adicionados!`);
          }
        } catch (err) {
          console.error("Erro ao processar QR Code:", err);
          alert("Erro ao processar QR Code.");
        } finally {
          qr.stop().then(() => {
            document.getElementById('reader').style.display = 'none';
          });
        }
      }
    },
    error => {
      // Ignora falhas de leitura
    }
  ).catch(err => {
    console.error("Erro ao iniciar scanner:", err);
  });
}

