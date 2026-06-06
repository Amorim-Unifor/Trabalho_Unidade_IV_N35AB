(function(){
  const form = document.getElementById('conv-form'); 
  const inputValue = document.getElementById('value-input');
  const selectFrom = document.getElementById('from');
  const selectTo = document.getElementById('to');
  const resultCard = document.getElementById('result');
  const expressionEl = document.getElementById('expression');
  const valueOutEl = document.getElementById('value-out');
  const errorEl = document.getElementById('error');
  const apiBaseInput = document.getElementById('api-base');
  const pingBtn = document.getElementById('ping');
  const healthOut = document.getElementById('health-out');
  const clearBtn = document.getElementById('clear');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = inputValue.value;
    const from = selectFrom.value;
    const to = selectTo.value;
    errorEl.textContent = '';
    valueOutEl.textContent = '—';
    expressionEl.textContent = '—';

    try {
      const resp = await fetch(`${apiBaseInput.value.replace(/\/+$/,'')}/api/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, value })
      });
      const data = await resp.json();
      resultCard.classList.remove('hidden');
      if (!resp.ok) {
        errorEl.textContent = data?.error || 'Erro na requisição';
        return;
      }
      // Se a API retornar uma expressão como "A = B unit", dividimos
      // para mostrar apenas uma igualdade: a parte esquerda em `expressionEl`
      // e a parte direita (com unidade) em `valueOutEl`.
      if (data.expression && data.expression.includes('=')) {
        const parts = data.expression.split('=');
        expressionEl.textContent = parts[0].trim();
        valueOutEl.textContent = parts.slice(1).join('=').trim();
      } else {
        expressionEl.textContent = data.expression ?? `${value} ${from}`;
        // Mostrar resultado com unidade quando possível
        valueOutEl.textContent = data.result !== undefined ? `${data.result} ${to}` : '—';
      }
    } catch (err) {
      resultCard.classList.remove('hidden');
      errorEl.textContent = 'Falha ao conectar ao backend. Verifique se o servidor está rodando.';
      console.error(err);
    }
  });

  pingBtn.addEventListener('click', async () => {
    healthOut.textContent = 'Testando...';
    try {
      const r = await fetch(`${apiBaseInput.value.replace(/\/+$/,'')}/api/health`);
      const j = await r.json();
      healthOut.textContent = `Status: ${j.status} • ${j.time}`;
    } catch(e){
      healthOut.textContent = 'Falha ao conectar.';
    }
  });

  clearBtn.addEventListener('click', () => {
    inputValue.value = '';
    selectFrom.value = 'm';
    selectTo.value = 'km';
    resultCard.classList.add('hidden');
    errorEl.textContent = '';
  });
})();
