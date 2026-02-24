async function fazerLogin() {
    const login = document.getElementById('user').value;
    const senha = document.getElementById('pass').value;

    const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({login, senha})
    });

    const data = await res.json();
    if (data.id) {
    localStorage.setItem('usuario', JSON.stringify(data));
    window.location.href = 'dashboard.html';
    } else {
    alert(data.error || 'Erro ao logar');
}
}